package lib

// Default settings
var (
	RootDir  string = "."
	ServeDir string = "."
)

func GetPath(path string) string {
	return RootDir + path
}

func GetServePath(path string) string {
	return ServeDir + path
}
