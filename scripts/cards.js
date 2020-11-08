import projects from "/projects.js"

function generateCard(title, text, url, imgUrl) {
    let column = document.createElement('div')
    column.className = "col-md-4 mb-5"

    // <card>
    let card = document.createElement('div')
    card.className = "card h-100"

    let img = document.createElement('div')
    img.className = `card-img-top ${randomBackgroundClass()}`
    if (imgUrl !== "" && imgUrl !== undefined) {
        let imgImg = document.createElement('img')
        imgImg.src = imgUrl
        img.appendChild(imgImg)
    }
    card.appendChild(img)

    // <card body>
    let body = document.createElement('div')
    body.className = "card-body"

    let bodyTitle = document.createElement('h4')
    bodyTitle.className = "card-title"
    let titleUrl = document.createElement('a')
    titleUrl.href = url
    titleUrl.innerText = title
    bodyTitle.appendChild(titleUrl)
    body.appendChild(bodyTitle)

    let bodyText = document.createElement('p')
    bodyText.className = "card-text"
    bodyText.innerText = text
    body.appendChild(bodyText)

    card.appendChild(body)
    // </card body>

    column.appendChild(card)
    // </card>

    return column
}

function generateCards(projects) {
    const cards = $('#cards')
    cards.html('')
    for (let i in projects) {
        if (!projects.hasOwnProperty(i)) continue

        let project = projects[i]
        cards.append(generateCard(project['title'], project['description'],
            project['url'], project['imgUrl']))
    }
}

function randomBackgroundClass() {
    const classes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark']
        .map(e => `bg-${e}`)
    return classes[randInt(0, classes.length)]
}

generateCards(projects)