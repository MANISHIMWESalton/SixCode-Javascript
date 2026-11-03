
const starterBooks = [
  { id: 1, title: "Atomic Habits", author: "James Clear", pages: 320, read: false, cover: "", file: "", description: "", color: "#e8d7b5" },
  { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien", pages: 310, read: true, cover: "", file: "", description: "", color: "#2e4a2f" },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", pages: 464, read: true, cover: "", file: "", description: "A practical guide to writing readable, maintainable code.", color: "#0f2a33" },
  { id: 4, title: "Dune", author: "Frank Herbert", pages: 412, read: true, cover: "", file: "", description: "", color: "#c2521c" },
  { id: 5, title: "The Martian", author: "Andy Weir", pages: 360, read: true, cover: "", file: "", description: "A good story for everyone.", color: "#d9581f" },
];

const STORAGE_KEY = "my-library-books";


let books = loadBooks();


const grid = document.getElementById("bookGrid");
const emptyMsg = document.getElementById("emptyMsg");
const searchInput = document.getElementById("search");
const dialog = document.getElementById("bookDialog");
const form = document.getElementById("bookForm");

function loadBooks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterBooks;
  } catch {
    return starterBooks;
  }
}

function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
  }
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function coverHTML(book) {
  if (book.cover) {
    return `<img class="cover" src="${escapeHTML(book.cover)}" alt="Cover of ${escapeHTML(book.title)}" />`;
  }
  return `
    <div class="cover placeholder" style="background:${book.color || "#4b5563"}">
      <strong>${escapeHTML(book.title)}</strong>
      <span>${escapeHTML(book.author)}</span>
    </div>`;
}

function cardHTML(book) {
  return `
    <article class="card" data-id="${book.id}">
      <div class="card-top">
        ${coverHTML(book)}
        <div class="info">
          <h3>${escapeHTML(book.title)}</h3>
          <p class="author">${escapeHTML(book.author)}</p>
          <p class="pages">${book.pages} pages</p>
          <button class="badge ${book.read ? "" : "unread"}" data-action="toggle"
                  title="Click to mark as ${book.read ? "unread" : "read"}">
            ${book.read ? "✓ Read" : "○ Not Read"}
          </button>
          ${book.description ? `<p class="desc">${escapeHTML(book.description)}</p>` : ""}
        </div>
        <button class="download" data-action="download" aria-label="Download ${escapeHTML(book.title)}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
      <div class="card-actions">
        <button class="btn btn-read ${book.read ? "" : "faded"}" data-action="read">Read Book</button>
        <button class="btn btn-remove" data-action="remove">Remove</button>
      </div>
    </article>`;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = books.filter(
    (b) => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
  );

  grid.innerHTML = visible.map(cardHTML).join("");
  emptyMsg.hidden = visible.length > 0;
}
function toggleRead(book) {
  book.read = !book.read;
}

function readBook(book) {
  if (book.file) {
    window.open(book.file, "_blank");
  } else {
    alert(`No file added for "${book.title}" yet.`);
  }
  book.read = true;
}

function downloadBook(book) {
  const link = document.createElement("a");
  if (book.file) {
    link.href = book.file;
    link.download = "";
  } else {
    const text = `Title: ${book.title}\nAuthor: ${book.author}\nPages: ${book.pages}\nStatus: ${book.read ? "Read" : "Not read"}\n${book.description ? "Notes: " + book.description : ""}`;
    link.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    link.download = `${book.title}.txt`;
  }
  link.click();
}

function removeBook(book) {
  if (confirm(`Remove "${book.title}" from your library?`)) {
    books = books.filter((b) => b.id !== book.id);
  }
}

grid.addEventListener("click", (e) => {
  const button = e.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.closest(".card").dataset.id);
  const book = books.find((b) => b.id === id);
  if (!book) return;

  const actions = { toggle: toggleRead, read: readBook, download: downloadBook, remove: removeBook };
  actions[button.dataset.action](book);

  saveBooks();
  render();
});

searchInput.addEventListener("input", render);

document.getElementById("newBookBtn").addEventListener("click", () => dialog.showModal());

document.getElementById("cancelBtn").addEventListener("click", () => {
  form.reset();
  dialog.close();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const colors = ["#2e4a2f", "#0f2a33", "#c2521c", "#5b3a8c", "#1e40af", "#7c2d12"];

  books.push({
    id: Date.now(),
    title: data.get("title").trim(),
    author: data.get("author").trim(),
    pages: Number(data.get("pages")),
    cover: data.get("cover").trim(),
    file: data.get("file").trim(),
    description: data.get("description").trim(),
    read: data.get("read") === "on",
    color: colors[Math.floor(Math.random() * colors.length)],
  });

  saveBooks();
  render();
  form.reset();
  dialog.close();
});

render();