package main

import (
  "log"
  "net/http"
  "os"

  "github.com/gorilla/mux"
  "github.com/joho/godotenv"
)

func main() {
  err := godotenv.Load()
  if err != nil {
    log.Fatal("Error loading .env file")
  }

  router := mux.NewRouter()

  // Define your routes here

  log.Fatal(http.ListenAndServe(":8000", router))
}

