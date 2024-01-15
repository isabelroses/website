package lib

// Default settings
var RootDir string = "./" // remember trailing slash

func GetPath(path string) string {
	return RootDir + path
}
