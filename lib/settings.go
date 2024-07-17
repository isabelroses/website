package lib

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

func GetServePath(path string) string {
	return os.Getenv("SERVE_DIR") + path
}
