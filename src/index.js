// Создай фронтенд часть приложения поиска и просмотра изображений по ключевому слову

// Для HTTP запросов использована библиотека axios.
// Для уведомлений использована библиотека notiflix.
// В качестве бэкенда используй публичный API сервиса Pixabay. Зарегистрируйся, получи свой уникальный ключ доступа и ознакомься с документацией.
import axios from "axios";
import Notiflix from 'notiflix';
// Описан в документации
import SimpleLightbox from "simplelightbox";
// Дополнительный импорт стилей
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', goFetch);
let page = 0;
let searchQuerry = '';

function onFormSubmit(evt) {
  evt.preventDefault();
  searchQuerry = evt.currentTarget.elements.searchQuery.value;
  loadMoreBtn.hidden = true;
  gallery.innerHTML = '';
  page = 0;
  if (!evt.currentTarget.elements.searchQuery.value.trim()) {
    Notiflix.Notify.failure("You didn't enter anything in the search field.");
    return;
  }

  goFetch();
}

// Pixabay API поддерживает пагинацию и предоставляет параметры page и per_page. Сделай так, чтобы в каждом ответе приходило 40 объектов (по умолчанию 20).

// Изначально значение параметра page должно быть 1.
// При каждом последующем запросе, его необходимо увеличить на 1.
// При поиске по новому ключевому слову значение page надо вернуть в исходное, так как будет пагинация по новой коллекции изображений.

async function goFetch() {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '32987508-f7eda598a3e8f7370936a3070';

  page += 1;
// // Список параметров строки запроса которые тебе обязательно необходимо указать:
// уникальный ключ доступа к API.
// q - термин для поиска. То, что будет вводить пользователь.
// image_type - тип изображения.
// orientation - ориентация фотографии.
// safesearch - фильтр по возрасту. 
    // Сделай так, чтобы в каждом ответе приходило 40 объектов
  try {
    const responce = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${searchQuerry}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );

    let totalHits = responce.data.totalHits;
      if (totalHits === 0) {
        
        //   Если бэкенд возвращает пустой массив, значит ничего подходящего найдено небыло. В таком случае показывай уведомление с текстом "Sorry, there are no images matching your search query. Please try again.". Для уведомлений используй библиотеку notiflix.
          
      Notiflix.Notify.failure(
        "Sorry, there are no images matching your search query. Please try again."
      );
      return;
      } else if (page === 1) {
          
        //   После первого запроса при каждом новом поиске выводить уведомление в котором будет написано сколько всего нашли изображений (свойство totalHits). Текст уведомления "Hooray! We found totalHits images."
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    renderMarkup(responce.data.hits);
    if (page * 40 >= totalHits) {
      loadMoreBtn.hidden = true;
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
}

// В ответе будет массив изображений удовлетворивших критериям параметров запроса. Каждое изображение описывается объектом, из которого тебе интересны только следующие свойства:

// webformatURL - ссылка на маленькое изображение для списка карточек.
// largeImageURL - ссылка на большое изображение.
// tags - строка с описанием изображения. Подойдет для атрибута alt.
// likes - количество лайков.
// views - количество просмотров.
// comments - количество комментариев.
// downloads - количество загрузок.

function renderMarkup(cards) {
    try {
      let cardsMarkup = cards
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,    
      }) => `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" class="photo" loading="lazy" width=100%/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b><br>${likes}
    </p>
    <p class="info-item">
      <b>Views</b><br>${views}
    </p>
    <p class="info-item">
      <b>Comments</b><br>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b><br>${downloads}
    </p>
  </div>
</div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', cardsMarkup);
        loadMoreBtn.hidden = false;
        } catch (error) {
    console.log(error);
  }
}

// var lightbox = new SimpleLightbox('.photo-card', {
//     captionsData: "alt",
//     captionDelay: 250,
//  });

const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});