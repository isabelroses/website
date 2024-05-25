package lib

import (
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer"
	"github.com/yuin/goldmark/renderer/html"
	"github.com/yuin/goldmark/text"
	"github.com/yuin/goldmark/util"
)

type codeBlockContext struct {
	attributes ImmutableAttributes
	language   []byte
}

func newCodeBlockContext(language []byte, attrs ImmutableAttributes) CodeBlockContext {
	return &codeBlockContext{
		language:   language,
		attributes: attrs,
	}
}

// CodeBlockContext holds contextual information of code highlighting.
type CodeBlockContext interface {
	// Language returns (language, true) if specified, otherwise (nil, false).
	Language() ([]byte, bool)

	// Attributes return attributes of the code block.
	Attributes() ImmutableAttributes
}

func (c *codeBlockContext) Attributes() ImmutableAttributes {
	return c.attributes
}

func (c *codeBlockContext) Language() ([]byte, bool) {
	if c.language != nil {
		return c.language, true
	}
	return nil, false
}

// ImmutableAttributes is a read-only interface for ast.Attributes.
type ImmutableAttributes interface {
	// Get returns (value, true) if an attribute associated with given
	// name exists, otherwise (nil, false)
	Get(name []byte) (interface{}, bool)

	// GetString returns (value, true) if an attribute associated with given
	// name exists, otherwise (nil, false)
	GetString(name string) (interface{}, bool)

	// All returns all attributes.
	All() []ast.Attribute
}

type immutableAttributes struct {
	n ast.Node
}

func (a *immutableAttributes) Get(name []byte) (interface{}, bool) {
	return a.n.Attribute(name)
}

func (a *immutableAttributes) GetString(name string) (interface{}, bool) {
	return a.n.AttributeString(name)
}

func (a *immutableAttributes) All() []ast.Attribute {
	if a.n.Attributes() == nil {
		return []ast.Attribute{}
	}
	return a.n.Attributes()
}

// Config struct holds options for the extension.
type Config struct {
	html.Config
}

// NewConfig returns a new Config with defaults.
func NewConfig() Config {
	return Config{
		Config: html.NewConfig(),
	}
}

// SetOption implements renderer.SetOptioner.
func (c *Config) SetOption(name renderer.OptionName, value interface{}) {
	c.Config.SetOption(name, value)
}

// Option interface is a functional option interface for the extension.
type Option interface {
	renderer.Option
}

type withHTMLOptions struct {
	value []html.Option
}

func (o *withHTMLOptions) SetConfig(c *renderer.Config) {
	if o.value != nil {
		for _, v := range o.value {
			v.(renderer.Option).SetConfig(c)
		}
	}
}

// WithHTMLOptions is functional option that wraps goldmark HTMLRenderer options.
func WithHTMLOptions(opts ...html.Option) Option {
	return &withHTMLOptions{opts}
}

// HTMLRenderer struct is a renderer.NodeRenderer implementation for the extension.
type HTMLRenderer struct {
	Config
}

// NewHTMLRenderer builds a new HTMLRenderer with given options and returns it.
func NewHTMLRenderer() renderer.NodeRenderer {
	r := &HTMLRenderer{
		Config: NewConfig(),
	}
	return r
}

// RegisterFuncs implements NodeRenderer.RegisterFuncs.
func (r *HTMLRenderer) RegisterFuncs(reg renderer.NodeRendererFuncRegisterer) {
	reg.Register(ast.KindFencedCodeBlock, r.renderFencedCodeBlock)
}

func getAttributes(node *ast.FencedCodeBlock, infostr []byte) ImmutableAttributes {
	if node.Attributes() != nil {
		return &immutableAttributes{node}
	}
	if infostr != nil {
		attrStartIdx := -1

		for idx, char := range infostr {
			if char == '{' {
				attrStartIdx = idx
				break
			}
		}
		if attrStartIdx > 0 {
			n := ast.NewTextBlock() // dummy node for storing attributes
			attrStr := infostr[attrStartIdx:]
			if attrs, hasAttr := parser.ParseAttributes(text.NewReader(attrStr)); hasAttr {
				for _, attr := range attrs {
					n.SetAttribute(attr.Name, attr.Value)
				}
				return &immutableAttributes{n}
			}
		}
	}
	return nil
}

func (r *HTMLRenderer) renderFencedCodeBlock(w util.BufWriter, source []byte, node ast.Node, entering bool) (ast.WalkStatus, error) {
	n := node.(*ast.FencedCodeBlock)
	if !entering {
		return ast.WalkContinue, nil
	}

	_, _ = w.WriteString("<div class=\"codeblock relative\"><button class=\"absolute right-0 top-0 m-2 p-1 cursor-pointer bg-bg hover:bg-bg-darker hidden md:block rounded-md\" title=\"copy to clipboard\" aria-label=\"copy to clipboard\"><svg class=\"fill-fg hover:fill-special size-6\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 384 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z\"/></svg></button><pre><code")
	language := n.Language(source)
	if language != nil {
		_, _ = w.WriteString(" class=\"language-")
		r.Writer.Write(w, language)
		_, _ = w.WriteString("\"")
	}
	_ = w.WriteByte('>')

	l := n.Lines().Len()
	for i := 0; i < l; i++ {
		line := n.Lines().At(i)
		r.Writer.RawWrite(w, line.Value(source))
	}

	_, _ = w.WriteString("</code></pre></div>\n")

	return ast.WalkContinue, nil
}

type codewrap struct {
	options []Option
}

var Codewrap = &codewrap{
	options: []Option{},
}

// NewCodewrap returns a new extension with given options.
func NewCodewrap(opts ...Option) goldmark.Extender {
	return &codewrap{
		options: opts,
	}
}

// Extend implements goldmark.Extender.
func (e *codewrap) Extend(m goldmark.Markdown) {
	m.Renderer().AddOptions(renderer.WithNodeRenderers(
		util.Prioritized(NewHTMLRenderer(), 200),
	))
}
