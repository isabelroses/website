package lib

import "os"

func GetPath(path string) string {
	dir, _ := os.Getwd()
	return dir + path
}
