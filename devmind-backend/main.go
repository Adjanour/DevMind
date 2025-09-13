package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/joho/godotenv"
)

// Models
type Note struct {
	ID          uint      `json:"id" gorm:"primary_key"`
	Title       string    `json:"title" gorm:"not null"`
	Content     string    `json:"content" gorm:"type:text;not null"`
	ContentType string    `json:"contentType" gorm:"default:'markdown'"`
	Tags        string    `json:"tags" gorm:"type:text"` // JSON string of tags array
	IsPinned    bool      `json:"isPinned" gorm:"default:false"`
	IsArchived  bool      `json:"isArchived" gorm:"default:false"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Tag struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	Name      string    `json:"name" gorm:"unique;not null"`
	Color     string    `json:"color" gorm:"default:'#3b82f6'"`
	CreatedAt time.Time `json:"createdAt"`
}

type Timeline struct {
	ID          uint      `json:"id" gorm:"primary_key"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description" gorm:"type:text"`
	Milestones  string    `json:"milestones" gorm:"type:text"` // JSON string
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

var db *gorm.DB

func initDB() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost/devmind?sslmode=disable"
	}

	db, err = gorm.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	db.AutoMigrate(&Note{}, &Tag{}, &Timeline{})
}

// CORS middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Note handlers
func getNotes(w http.ResponseWriter, r *http.Request) {
	var notes []Note
	query := db.Order("created_at desc")

	// Handle search query
	search := r.URL.Query().Get("search")
	if search != "" {
		query = query.Where("title ILIKE ? OR content ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Handle tag filter
	tag := r.URL.Query().Get("tag")
	if tag != "" {
		query = query.Where("tags LIKE ?", "%"+tag+"%")
	}

	// Handle pinned filter
	if r.URL.Query().Get("pinned") == "true" {
		query = query.Where("is_pinned = ?", true)
	}

	// Handle archived filter
	if r.URL.Query().Get("archived") != "true" {
		query = query.Where("is_archived = ?", false)
	}

	query.Find(&notes)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

func createNote(w http.ResponseWriter, r *http.Request) {
	var note Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if note.Title == "" {
		note.Title = "Untitled Note"
	}

	db.Create(&note)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

func updateNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	var note Note
	if db.First(&note, id).RecordNotFound() {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}

	var updates Note
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db.Model(&note).Updates(updates)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

func deleteNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	db.Delete(&Note{}, id)
	w.WriteHeader(http.StatusNoContent)
}

// Tag handlers
func getTags(w http.ResponseWriter, r *http.Request) {
	var tags []Tag
	db.Find(&tags)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}

func createTag(w http.ResponseWriter, r *http.Request) {
	var tag Tag
	if err := json.NewDecoder(r.Body).Decode(&tag); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db.Create(&tag)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tag)
}

// Timeline handlers
func getTimelines(w http.ResponseWriter, r *http.Request) {
	var timelines []Timeline
	db.Order("created_at desc").Find(&timelines)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(timelines)
}

func createTimeline(w http.ResponseWriter, r *http.Request) {
	var timeline Timeline
	if err := json.NewDecoder(r.Body).Decode(&timeline); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db.Create(&timeline)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(timeline)
}

func updateTimeline(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid timeline ID", http.StatusBadRequest)
		return
	}

	var timeline Timeline
	if db.First(&timeline, id).RecordNotFound() {
		http.Error(w, "Timeline not found", http.StatusNotFound)
		return
	}

	var updates Timeline
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db.Model(&timeline).Updates(updates)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(timeline)
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	initDB()
	defer db.Close()

	router := mux.NewRouter()
	api := router.PathPrefix("/api").Subrouter()

	// Note routes
	api.HandleFunc("/notes", getNotes).Methods("GET")
	api.HandleFunc("/notes", createNote).Methods("POST")
	api.HandleFunc("/notes/{id}", updateNote).Methods("PUT")
	api.HandleFunc("/notes/{id}", deleteNote).Methods("DELETE")

	// Tag routes
	api.HandleFunc("/tags", getTags).Methods("GET")
	api.HandleFunc("/tags", createTag).Methods("POST")

	// Timeline routes
	api.HandleFunc("/timelines", getTimelines).Methods("GET")
	api.HandleFunc("/timelines", createTimeline).Methods("POST")
	api.HandleFunc("/timelines/{id}", updateTimeline).Methods("PUT")

	// Enable CORS
	handler := enableCORS(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	fmt.Printf("DevMind API server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

