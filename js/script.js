"use strict";

let elForm = document.querySelector(".search-form");
let elBooks = document.querySelector(".books");
let elPaginationList = document.querySelector(".pagination__btns");
let elBookmark = document.querySelector(".bookmark__list");
let elCardBtns = document.querySelector(".books__btns");
let elCard = document.querySelector(".books__card");
let elCardNull = document.querySelector(".cards-default");
let elNewest = document.querySelector(".main__orderbtn");
let elCanvas = document.querySelector(".canvas");

let inputValue = "search+terms";
let page = 1;
let startIndex = (page - 1) * 15 + 1;
let bookmarkBooks =
  JSON.parse(window.localStorage.getItem("localBookmark")) || [];
let bookmarkId = null;
let infoId;
let data;
let orederByNewest = "&";

if (window.localStorage.getItem("token") == null) {
  window.location.replace("login.html");
}

logout.addEventListener("click", function (evt) {
  let localToken = window.localStorage.getItem("token");
  if (localToken) {
    window.localStorage.removeItem("token");
  }
  window.location.replace("login.html");
});

renderBookmark(bookmarkBooks, elBookmark);

const renderdata = async function () {
  startIndex = (page - 1) * 15 + 1;
  try {
    let request = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${inputValue}&maxResults=15&startIndex=${startIndex}${orederByNewest}`
    );

    data = await request.json();
    renderCards(data, elBooks);
    renderBtns(data, elPaginationList);
  } catch {
    errorRender();
  }
};
renderdata();

function errorRender() {
  let error = `API BILAN BOG'LIQ MUAMMO YUZAGA KELDI !!!`;
  elBooks.insertAdjacentHTML("beforeend", error);
  pagination.classList.add("visually-hidden");
}

function renderCards(data, element) {
  element.innerHTML = null;
  let books = data.items;
  let bookmarkId = 0;
  let author;
  let year;
  if (books === undefined) {
    elCardNull.classList.remove("visually-hidden");
    pagination.classList.add("visually-hidden");
  } else {
    books.forEach((book) => {
      if (book.volumeInfo.authors == undefined) {
        author = "Muallif keltirilmagan !";
      } else {
        author = book.volumeInfo.authors;
      }

      if (book.volumeInfo.publishedDate == undefined) {
        year = "Yil keltirilmagan !";
      } else {
        year = book.volumeInfo.publishedDate;
      }

      const htmlbook = `<div class="books__card col-3  ">
                <div class="books__card-img">
                  <img
                    class="books__img"
                    src=${book.volumeInfo.imageLinks?.smallThumbnail}
                    alt="book image"
                  />
                </div>

                <div class="books__card-body">
                  <h2 class="books__name" >${book.volumeInfo.title}</h2>
                  <p class="books__author" >${author}</p>
                  <p class="books__year" >${year}</p>
                </div>
                <div
                    class="books__btns d-flex flex-wrap justify-content-between "
                  >
                    <button class="books__bookmark-btn" data-bookmarkBtn="${bookmarkId}">Bookmark</button>
                    <button class="books__info-btn" data-infoBtn="${bookmarkId}" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">More Info</button>
                    <a href="${book.volumeInfo.previewLink}" class="books__read-btn" data-readBtn="${bookmarkId}">Read</a>
                  </div>
              </div>`;
      element.insertAdjacentHTML("beforeend", htmlbook);
      bookmarkId++;
    });
  }
}

function moveToCenter(page) {
  let a = document.createElement("a");
  a.href = `#z${page}`;
  a.innerHTML = "";
  a.click();
}

function renderBtns(data, element) {
  if (data.totalItems != 0 && data.items != undefined) {
    pagination.classList.remove("visually-hidden");
    elCardNull.classList.add("visually-hidden");
    showResult.textContent = data.totalItems;
  } else {
    showResult.textContent = 0;
  }

  element.innerHTML = null;
  let btnsnumber = Math.ceil(data.totalItems / 15);
  for (let i = 1; i <= btnsnumber; i++) {
    let htmlBtns = `<button id="z${i}" class="books-btn">${i}</button> `;

    if (page == i) {
      htmlBtns = `<button id="z${i}" class="activeBtn books-btn ">${i}</button> `;
    }
    element.insertAdjacentHTML("beforeend", htmlBtns);
  }

  if (page == 1) {
    prevBtn.disabled = true;
    prevBtn.classList.add("prev-bg");
  } else {
    prevBtn.disabled = false;
    prevBtn.classList.remove("prev-bg");
  }

  if (page == btnsnumber) {
    nextBtn.disabled = true;
    nextBtn.classList.add("prev-bg");
  } else {
    nextBtn.disabled = false;
    nextBtn.classList.remove("prev-bg");
  }
}

elPaginationList.addEventListener("click", function (evt) {
  page = Number(evt.target.textContent);
  renderdata();
});

prevBtn.addEventListener("click", function () {
  page--;
  moveToCenter(page)
  renderdata();
});
nextBtn.addEventListener("click", function () {
  page++;
  moveToCenter(page)
  renderdata();
});

elForm.addEventListener("submit", function (evt) {
  evt.preventDefault();

  inputValue = searchInput.value;
  renderdata();
});

elBooks.addEventListener("click", function (evt) {
  if (evt.target.matches(".books__bookmark-btn")) {
    bookmarkId = evt.target.dataset.bookmarkbtn;
    bookMarkPush(data);
  }
});

function bookMarkPush(data) {
  let books = data.items;
  if (bookmarkId) {
    if (!bookmarkBooks.find((book) => book.id == books[bookmarkId].id)) {
      bookmarkBooks.push(books[bookmarkId]);
      window.localStorage.setItem(
        "localBookmark",
        JSON.stringify(bookmarkBooks)
      );
    }
  }

  bookmarkBooks =
    JSON.parse(window.localStorage.getItem("localBookmark")) || [];
  renderBookmark(bookmarkBooks, elBookmark);
}

function renderBookmark(books, element) {
  if (books.length > 0 || bookmarkBooks != null) {
    element.innerHTML = null;
    let author;
    let counter = 0;
    books.forEach((book) => {
      if (book.volumeInfo.authors == undefined) {
        author = "Muallif keltirilmagan !";
      } else {
        author = book.volumeInfo.authors;
      }

      const htmlbook = `<li class="bookmark__item">
      <div class="bookmark__item-right">
        <p class="bookmark__item-name">${book.volumeInfo.title}</p>
        <p class="bookmark__item-author">${author}</p>
      </div>
      <div class="bookmark__item-left">
        <a class="bookmark__read" href="${book.volumeInfo.previewLink}" >
          <img data-bookmarkreadid="${counter}" src="./img/book-open.svg" alt="book icon" />
        </a>
        <button class="bookmark__delete" >
          <img  data-bookmarkdeleteid="${counter}" class="bookmark__delete-icon" src="./img/delete.svg" alt="delete-icon" />
        </button>
      </div>
    </li>`;
      counter++;
      element.insertAdjacentHTML("beforeend", htmlbook);
    });
  }
}

elBookmark.addEventListener("click", function (evt) {
  if (evt.target.matches(".bookmark__delete-icon")) {
    let bookmarkBooksId = evt.target.dataset.bookmarkdeleteid;
    bookmarkBooks.splice(bookmarkBooksId, 1);
    window.localStorage.setItem("localBookmark", JSON.stringify(bookmarkBooks));
    renderBookmark(bookmarkBooks, elBookmark);
  }
});

elNewest.addEventListener("click", function () {
  orederByNewest = "&";
  orederByNewest += "orderBy=newest";
  renderdata();
});

elBooks.addEventListener("click", function (evt) {
  if (evt.target.matches(".books__info-btn")) {
    infoId = evt.target.dataset.infobtn;
    renderCanvas(data, elCanvas);
  }
});

function renderCanvas(data, element) {
  element.innerHTML = null;
  let bookInfo = data.items[infoId];
  let description;
  let author;
  let year;
  let publisher;
  let categorie;
  let pageCount;

  if (bookInfo.volumeInfo.description == undefined) {
    description = "Ma'lumot keltirilmagan !";
  } else {
    description = bookInfo.volumeInfo.description;
  }

  if (bookInfo.volumeInfo.publishedDate == undefined) {
    year = "Yil keltirilmagan !";
  } else {
    year = bookInfo.volumeInfo.publishedDate;
  }

  if (bookInfo.volumeInfo.authors == undefined) {
    author = "Ma'lumot yo'q";
  } else {
    author = bookInfo.volumeInfo.authors[0];
  }

  if (bookInfo.volumeInfo.publisher == undefined) {
    publisher = "Ma'lumot yo'q";
  } else {
    publisher = bookInfo.volumeInfo.publisher;
  }

  if (bookInfo.volumeInfo.categories == undefined) {
    categorie = "Ma'lumot yo'q";
  } else {
    categorie = bookInfo.volumeInfo.categories[0];
  }

  if (bookInfo.volumeInfo.pageCount == undefined) {
    pageCount = "Ma'lumot yo'q";
  } else {
    pageCount = bookInfo.volumeInfo.pageCount;
  }

  let htmlInfoCard = `<div class="offcanvas-header">
    <h5 class="canvas__name" id="offcanvasRightLabel">${bookInfo.volumeInfo.title}</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <img class="canvas__img" src="${bookInfo.volumeInfo.imageLinks?.smallThumbnail}" alt="photo" >
    <p class="canvas__desc">${description}</p>
  </div>
  <ul class="canvas__list">
    <li class="canvas__item">Author : <p class="canvas__item-book">${author}</p></li>
     <li class="canvas__item">Published : <p class="canvas__item-book">${year}</p></li>
    <li class="canvas__item">Publishers: <p class="canvas__item-book">${publisher}</p></li>
    <li class="canvas__item">Categories:<p class="canvas__item-book">${categorie}</p></li>
    <li class="canvas__item">Pages Count:<p class="canvas__item-book">${pageCount}</p></li>
  </ul>
  <div class="canvas__footer"><a href="${bookInfo.volumeInfo.previewLink}" class="canvas__read-btn">Read</a></div>`;
  element.insertAdjacentHTML("beforeend", htmlInfoCard);
}