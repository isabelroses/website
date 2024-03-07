package lib

import (
	"bufio"
	"encoding/json"
	"io"
	"log"
	"os"
)

var donosList = GetServePath("/donos.txt")

func readDonoFile() []string {
	file, err := os.Open(donosList)
	if err != nil {
		log.Fatal(err)
		return nil
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	var all []string
	for scanner.Scan() {
		line := scanner.Text()
		all = append(all, line)
	}

	return all
}

func GetDonors() Donors {
	file, err := os.Open(GetServePath("/donos.json"))
	if err != nil {
		log.Println("Error opening file:", err)
		return nil
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		log.Println("Error reading file:", err)
		return nil
	}

	var donors Donors
	err = json.Unmarshal(content, &donors)
	if err != nil {
		log.Println("Error parsing JSON:", err)
		return nil
	}

	return donors
}

func AppendTooDonos(newData map[string]interface{}) {
	file, err := os.OpenFile(GetServePath("/donos.json"), os.O_RDWR|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	var existingData []map[string]interface{}
	if err := json.NewDecoder(file).Decode(&existingData); err != nil && err.Error() != "EOF" {
		log.Println("Error decoding JSON:", err)
	}
	existingData = append(existingData, newData)

	// Move the file pointer to the beginning
	_, err = file.Seek(0, 0)
	if err != nil {
		log.Println("Error seeking file:", err)
	}

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "    ")
	if err := encoder.Encode(existingData); err != nil {
		log.Println("Error encoding JSON:", err)
	}
}
