import projects from "/projects.js?c=4"

function generateCard(title, text, url, imgUrl, buttons, icons, iconsOnButtons) {
    let column = document.createElement('div')
    column.className = "col-md-4 mb-5"

    // <card>
    let card = document.createElement('div')
    card.className = "card h-100"

    let img = document.createElement('div')
    img.className = `card-img-top`
    img.style.backgroundColor = randomColour()
    let imgLink = document.createElement('a')
    imgLink.href = url
    if (imgUrl !== "" && imgUrl !== undefined) {
        let imgImg = document.createElement('img')
        imgImg.src = imgUrl
        imgLink.appendChild(imgImg)
    }
    img.appendChild(imgLink)
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

    // <card footer>
    let footer = document.createElement('div')
    footer.className = "card-footer"

    for (let i in buttons) {
        if (!buttons.hasOwnProperty(i)) continue

        let button = buttons[i]
        let buttonElement = document.createElement('a')
        buttonElement.className = `btn`
        buttonElement.style.backgroundColor = randomColour()
        buttonElement.text = button['text']
        buttonElement.href = button['url']
        if (iconsOnButtons) {
            let icon = icons[i]
            let iconElement = document.createElement('i')
            iconElement.className = icon + ' icon'
            buttonElement.text += ' '
            buttonElement.appendChild(iconElement)
        }

        footer.appendChild(buttonElement)
    }

    if (!iconsOnButtons) {
        for (let i in icons) {
            if (!icons.hasOwnProperty(i)) continue

            let icon = icons[i]
            let iconWrapper = document.createElement('div')
            iconWrapper.className = 'icon-wrapper'
            let iconElement = document.createElement('i')
            iconElement.className = icon + ' icon'

            iconWrapper.appendChild(iconElement)
            footer.appendChild(iconWrapper)
        }
    }

    if (buttons === undefined || buttons.length === 0) {
        // If no links are present, generate a hidden button
        let button = document.createElement('a')
        button.className = 'btn d-hidden'
        button.text = 'Hiddem Sound System'
        footer.appendChild(button)
    }

    card.appendChild(footer)
        // </footer>

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
        cards.append(generateCard(
            project['title'],
            project['description'],
            project['url'],
            project['imgUrl'],
            project['buttons'],
            project['icons'],
            project['iconsOnButtons']
        ))
    }
}

let history = []
function randomColour() {
    const colours = [
        "#3588d1", "#bbc3fe", "#e68dd9", "#fe1d66",
        "#34f199", "#fb5de7", "#35afa6", "#f34207",
        "#9bd535", "#f6d91a"
    ]
    let pick;
    do {
        pick = colours[randInt(0, colours.length)]
    } while (history.includes(pick))
    history.push(pick)
    if (history.length > 3) {
        history.shift()
    }
    return pick
}

generateCards(projects)