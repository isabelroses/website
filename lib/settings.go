package lib

// Default settings
var RootDir string = "./" // remeber trailing slash

func GetPath(path string) string {
	return RootDir + path
}
