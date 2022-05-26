//--VARS--
const next_btn = document.getElementById('next-button');
const prev_btn = document.getElementById('prev-button');
const create_btn = document.getElementById('create');
const delete_article_btn = document.getElementById('delete-article');

const article_body = document.getElementById('article-content');
const article_title = document.getElementById('article-name');

const new_article_body = document.getElementById('new-article-content');
const new_article_title = document.getElementById('new-article-name');

const total_pages = document.getElementById('Total-Page-Number');
const current_page = document.getElementById('Current-Page-Number');

const create_box = document.getElementById('create-modal-id');
const create_background = document.getElementById('create-modal-background');

const cancel_create_button = document.getElementById('cancel-create-article');
const create_article_button = document.getElementById('create-article');

const ham_button = document.getElementById('login-ham');
const login_nav_div = document.getElementById('ham-dropdown');

const login_button = document.getElementById('login-button');
const register_button = document.getElementById('register-button');
const search_button = document.getElementById('search-button');

let header_user_name = document.getElementById('username-name');

const article_title_array = [];
const article_body_array = [];

let article_number = 0;
//--VARS--

//--FUNCTIONS--
document.addEventListener('DOMContentLoaded', function () {
    fetch('/getAll', {mode: 'cors'}).then(response => response.json())
        .then(data => loadArticles(data['data']));
})

function loadArticles(data) {
    console.log(data);
    if (data.length === 0) {
        article_title.innerText = "Welcome....";
        article_body.innerText = "Write an article with the create button..";
        return;
    }
    data.forEach(function ({
        article_title,
        article_body
    }) {
        article_body_array.push(article_body);
        article_title_array.push(article_title);
    });

    current_page.innerText = 1;
    total_pages.innerText = article_body_array.length;

    article_body.innerText = article_body_array[0];
    article_title.innerText = article_title_array[0];
}

//--BUTTON FUNCTIONS--
create_btn.onclick = function () {
    create_background.style.display = "block";
}

window.onclick = function (event) {
    if (event.target == create_background) {
        create_background.style.display = "none";
    }
}

cancel_create_button.onclick = function () {
    create_background.style.display = "none";
    //resetModal();
}

create_article_button.onclick = function () {
    const newTitle = new_article_title.value;
    const newBody = new_article_body.value;

    create_background.style.display = "none";

    new_article_title.value = "New Title";
    new_article_body.value = "New Body";

    fetch("/insert", {
            headers: {
                'Content-type': 'application/json'
            },
	    mode: 'cors',
            method: 'POST',
            body: JSON.stringify({
                nTitle: newTitle,
                nBody: newBody
            })
        })
        .then(response => response.json)
        .then(data => insertIntoScreen(data['data']));

     window.location.reload();
};

function insertIntoScreen(data) {}


delete_article_btn.onclick = function () {
    const currentTitle = article_title_array[article_number];
    const currentBody = article_body_array[article_number];

    console.log(currentTitle, currentBody);

    fetch("/deleteArticle", {
            headers: {
                'Content-type': 'application/json'
            },
	    mode: "cors",
            method: 'DELETE',
            body: JSON.stringify({
                currTitle: currentTitle,
                currBody: currentBody
            })
        })
        .then(response => response.json)
        .then(data => insertIntoScreen(data['data']));

    window.location.reload();
};

ham_button.onclick = function () {
    if (login_nav_div.style.display == "none") {
        login_nav_div.style.display = "block";
    } else {
        login_nav_div.style.display = "none";
    }
}

//--------------------------------------------------------------------------------
function advance() {
    if (article_body_array.length === 0) {
        article_number = 0;
        current_page.innerText = 0;
        total_pages.innerText = 0;

    } else {
        if ((article_number + 1) >= article_title_array.length) {
            article_number = 0;
            article_body.innerText = article_body_array[article_number];
            article_title.innerText = article_title_array[article_number];
            current_page.innerText = article_number + 1;
        } else {
            article_number += 1;
            article_body.innerText = article_body_array[article_number];
            article_title.innerText = article_title_array[article_number];
            current_page.innerText = article_number + 1;
        }
    }
}

function deadvance() {
    if (article_body_array.length === 0) {
        article_number = 0;
        current_page.innerText = 0;
        total_pages.innerText = 0;
    } else {
        if ((article_number - 1) < 0) {
            article_number = (article_title_array.length - 1);
            article_body.innerText = article_body_array[article_number];
            article_title.innerText = article_title_array[article_number];
            current_page.innerText = article_number + 1;
        } else {
            article_number -= 1;
            article_body.innerText = article_body_array[article_number];
            article_title.innerText = article_title_array[article_number];
            current_page.innerText = article_number + 1;
        }
    }
}
