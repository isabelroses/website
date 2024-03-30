---
title: Writing a Neovim plugin
description: A story about writing my first Neovim plugin
date: 29/03/2024
tags:
  - learning
  - neovim
---

## Introduction

I have been using Neovim for a while now, and I find it to be a great tool. However, I have never had the opportunity to write a plugin for it. Recently, I came across Charmbracelet's new app called ["Freeze"](https://github.com/charmbracelet/freeze) which I liked, the app allows you to generate images of code snippits. This inspired me to integrate it into Neovim.

## The Idea

The goal was to allow the user to select a range of text and then generate an image from that. If the user did not select an area of text then it would use the entire file. 

## The Implementation

To do this I created a set of allowed options the user could set when calling the `setup()` function for the plugin. The options would be identical to the arguments the cli command would take except in snake case. We could then use this data to generate a CLI command and call it with `vim.fn.system()`, and we could get the output and use that to give the user a log of what happened with `vim.notify()`.

I also wanted to ensure that the user's options would actually work, so I created a function that would check the options and ensure that they were correct. This was done by checking the options against a list of allowed options and ensuring they were the correct type. At this point I realized I was enforcing the user to use the command `freeze`, but I did not account for use cases other than mine, so this was added as an option.

## The struggle

Neovim's documentation when it comes to old and new versions and what APIs are available is not the best. I found myself having to look at the source code of the plugin manager I was using to see what was available. Thankfully [@comfysage](https://github.com/comfysage) managed to get to the bottom of it. The following snippet shows how we handle arrays and lists differently depending on Neovim versions.

```lua
local function is_array(...)
  if vim.fn.has("nvim-0.10") == 1 then
    return vim.tbl_isarray(...)
  else
    return vim.tbl_islist(...)
  end
end
```

## The outcome

The plugin was a success, and I was able to generate images from code snippets. I was also able to learn a lot about how to write a Neovim plugin and how to use the Neovim API. I was also able to learn a lot about how to use Vimscript and how to use the command line from within Neovim. This was a great experience, and I am thankful for it. See an example of the plugin below.

![Example of the plugin in action](/posts/2024-03-29_freeze.webp)
