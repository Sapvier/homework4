export class Images {
    constructor(api_url) {
        this.api_url = api_url
    }

    initialize() {
        document.addEventListener('DOMContentLoaded', () => this.getImages())
        this.closeExpanded()
        this.saveComment()
    }

    getImages() {
        fetch(this.api_url)
            .then(response => response.json())
            .then(images => addImages(images))
            .then(() => this.imageExpand())

        function addImages(images) {
            for (let item of images) {
                const img = document.createElement("img");
                img.src = `${item.url}`
                img.id = `${item.id}`
                img.width = 229
                img.height = 142
                document.querySelector('.images-container').appendChild(img);
            }
        }
    }

    imageExpand() {
        const images = document.querySelectorAll('img')
        for (let image of images) {
            image.addEventListener('click',() =>  this.clickHandler(image.id))
        }
    }

    clickHandler(id) {
        const overlay = document.querySelector('.image-expanded-overlay')
        const modal = document.querySelector('.image-expanded')

        overlay.style.display = 'flex'
        modal.style.display = 'flex'

        fetch(this.api_url + '/' + id)
            .then(response => response.json())
            .then(image => {
                this.addLargeImage(image)
                this.addComments(image)
                window.scrollTo({top: 0, behavior: 'smooth'});
            })
    }

    addLargeImage(image) {
        const modalImg = document.querySelector('.image-expanded')

        if (modalImg.firstElementChild.tagName === 'IMG') {
            modalImg.removeChild(modalImg.firstElementChild)
            createImage(image)
        }
        else {
            createImage(image)
        }
        function createImage(image) {
            const img = document.createElement("img")
            img.src = `${image.url}`
            img.height = 205
            img.width = 331
            img.style.order = '1'
            modalImg.id = image.id
            modalImg.insertBefore(img, modalImg.firstChild)
        }
    }

    closeExpanded() {
        const overlay = document.querySelector('.image-expanded-overlay')
        const modal = document.querySelector('.image-expanded')
        const cross = document.querySelector('span')
        overlay.addEventListener('click', () => {
            modal.style.display = 'none'
            overlay.style.display = 'none'
        })
        cross.addEventListener('click', () => {
            modal.style.display = 'none'
            overlay.style.display = 'none'
        })
    }
    saveComment() {
        const name = document.getElementById('name')
        const comment = document.getElementById('comment')
        const form = document.querySelector('.comments-form')
        const button = document.querySelector('.comment-button')

        let data = {
            name: '',
            comment: '',
            id: '',
            date: null
        }
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            data = {...data,
                id: document.querySelector('.image-expanded').id,
                date: Date.now()
            }
            if (data.name === '' || data.comment === '') {
               button.classList.add('error')
               setTimeout(() => {button.classList.remove('error')}, 3000);
            }
            else  {
                button.classList.add('success')
                postComment(data, this.api_url)
                setTimeout(() => {button.classList.remove('success')}, 3000);
            }
        })

        name.addEventListener('input', (e) => {
            data = {
                ...data,
                name: name.value
            }
        })
        comment.addEventListener('input', (e) => {
            data = {
                ...data,
                comment: comment.value
            }
        })

        function postComment(data, url) {
            fetch(url + '/' + data.id +'/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.status)
        }
    }

    addComments(image) {
        const months = ["Jan", "Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        const commentsWrapper = document.querySelector('.comments-wrapper')

        if (image.comments.length < 1) {
            commentsWrapper.innerHTML = ''
        }

        for (let item of image.comments) {
            addComment(item)
        }

        function addComment(item) {
            if (commentsWrapper.firstElementChild === null) {
                createComment(item)
            }
            else {
                commentsWrapper.removeChild(commentsWrapper.firstElementChild)
                createComment(item)
            }
        }
        function createComment(item) {
            const comment = document.createElement("div")
            const date = document.createElement("p")
            const text = document.createElement("p")
            const itemDate = new Date(item.date).toDateString()
            date.innerText = (months.indexOf(itemDate.slice(4, 7)) + 1) + '.' + itemDate.slice(8, 10) + '.' + itemDate.slice(11)
            text.innerText = `${item.text}`
            date.style.color = 'grey'
            comment.id = item.id
            commentsWrapper.appendChild(comment)
            comment.appendChild(date)
            comment.appendChild(text)
        }
    }
}

