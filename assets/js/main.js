const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function findBook(bookId) {
    for (bookItem of books){
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
}

function findBookIndex(bookId) {
    for (index in books) {
        if (books[index].id === bookId){
            return index;
        }
    }
}

function addBookToCompleted(bookId){
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));    
    saveData();
}

function removeBookFromCompleted(bookId){
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId){
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

function saveData()
{
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    
}

function getBookList() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function renderBookList(bookObject) {
    const {id, title, author, year, isCompleted} = bookObject;

    const textTitle = document.createElement("h3");
    textTitle.innerText = title;

    const textAuthor = document.createElement("p");
    textAuthor.innerText = author;

    const textYear = document.createElement('p');
    textYear.innerText = year;

    const action = document.createElement('div');
    action.classList.add('action');

    const textContainer = document.createElement("article");
    textContainer.classList.add("book_item");
    textContainer.append(textTitle, textAuthor, textYear, action);
    textContainer.setAttribute("id", `book-${id}`);
    

    if(isCompleted) {
        const completed = document.createElement('button');
        completed.classList.add('green');
        completed.innerText = "Belum Selesai Dibaca"
        completed.addEventListener("click", function() {
            undoBookFromCompleted(id);
        });
        
        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = "Hapus Buku";
        trashButton.addEventListener('click', function(){
            removeBookFromCompleted(id);
        })

        action.append(completed,trashButton);
    } else {
        const addToCompleted = document.createElement('button');
        addToCompleted.classList.add("green");
        addToCompleted.innerText = "Selesai dibaca";
        addToCompleted.addEventListener('click', function() {
            addBookToCompleted(id);
        })

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = "Hapus Buku";
        trashButton.addEventListener('click', function(){
            removeBookFromCompleted(id);
        })

        action.append(addToCompleted, trashButton);
    }

    return textContainer;
}

function addBook() {
    const title = document.getElementById("inputBookTitle").value;

    const author = document.getElementById("inputBookAuthor").value;

    const year = document.getElementById("inputBookYear").value;

    const isCompleted = document.getElementById("inputBookIsComplete").checked;

    const generatedID = generateId();

    const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    
}


document.addEventListener("DOMContentLoaded", function(){
    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener("submit", function(e) {
        e.preventDefault();
        addBook();
    });
    
    
    
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function(){
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';
    
    

    for (let book of books) {


        const bookElement = renderBookList(book);
        if(book.isCompleted){
            completeBookshelfList.append(bookElement);
        } else {
            incompleteBookshelfList.append(bookElement)
        }
    }
})