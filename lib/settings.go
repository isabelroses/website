package lib

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

// Default settings
var (
	RootDir string = "."
)

func GetPath(path string) string {
	return RootDir + path
}

func GetServePath(path string) string {
	return os.Getenv("SERVE_DIR") + path
}
