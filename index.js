document.addEventListener("DOMContentLoaded", () => {
    fetchMovieDetails(8); 
    fetchAllMovies(); 
    
});

function fetchMovieDetails(movieId) {
    fetch(`http://localhost:3000/films/${movieId}`)
        .then(res => res.json())
        .then(movie => showMovie(movie))
        .catch(err => console.log("Error:", err));
}

function fetchAllMovies() {
    fetch("http://localhost:3000/films")
        .then(res => res.json())
        .then(movies => displayMovieList(movies))
        .catch(err => console.log("Error:", err));
}

function displayMovieList(movies) {
    let filmList = document.getElementById("films");
    filmList.innerHTML = "";

    movies.forEach(movie => {
        let li = document.createElement("li");
        li.textContent = movie.title;
        li.dataset.id = movie.id;
        li.classList.add("film-item");

        li.addEventListener("click", () => fetchMovieDetails(movie.id));

      
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.classList.add("delete-btn");
        deleteButton.onclick = () => deleteMovie(movie.id, li);

        li.appendChild(deleteButton); 
        filmList.appendChild(li);
    });
}

function showMovie(movie) {
    document.getElementById("movie-title").textContent = movie.title;
    document.getElementById("movie-runtime").textContent = `Runtime: ${movie.runtime} mins`;
    document.getElementById("movie-showtime").textContent = `Showtime: ${movie.showtime}`;
    document.getElementById("movie-poster").src = movie.poster;

    let availableTickets = movie.capacity - movie.tickets_sold;
    let ticketElement = document.getElementById("movie-tickets");
    ticketElement.textContent = `Available Tickets: ${availableTickets}`;

    
    const buyButton = document.getElementById("buy-ticket");
    buyButton.textContent = availableTickets === 0 ? "Sold Out" : "Buy Ticket";
    buyButton.disabled = availableTickets === 0;
    buyButton.style.backgroundColor = availableTickets === 0 ? "gray" : "#28a745";

   
    buyButton.onclick = () => buyTicket(movie, availableTickets);
}

function buyTicket(movie, availableTickets) {
    if (availableTickets > 0) {
        let newTicketsSold = movie.tickets_sold + 1;

       
        fetch(`http://localhost:3000/films/${movie.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets_sold: newTicketsSold })
        })
        .then(res => res.json())
        .then(updatedMovie => {
            showMovie(updatedMovie); 

            return fetch("http://localhost:3000/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ film_id: movie.id, number_of_tickets: 1 })
            });
        })
        .then(res => res.json())
        .then(newTicket => console.log("New Ticket Added:", newTicket))
        .catch(err => console.error("Error:", err));
    }
}
function deleteMovie(movieId, movieElement) {
    if (confirm("Are you sure you want to delete this movie?")) {
        fetch(`http://localhost:3000/films/${movieId}`, {
            method: "DELETE"
        })
        .then(() => {
            movieElement.remove();
            console.log(`Movie ID ${movieId} deleted`);
        })
        .catch(err => console.error("Error deleting movie:", err));
    }
}