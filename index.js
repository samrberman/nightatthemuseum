const API_KEY = "7657d4b0-b77e-11e8-a4d1-69890776a30b";

//used to resize images
const min_side_length = 200
const max_side_length = 400

document.addEventListener("DOMContentLoaded", () => {
  const url = `https://api.harvardartmuseums.org/gallery?apikey=${API_KEY}`;
  navigateByUrl(url)
});

window.addEventListener('hashchange', () => {
  const url = `https://api.harvardartmuseums.org/gallery?apikey=${API_KEY}`;
  navigateByUrl(url)
});

//navigate to gallery or object based on number after # in url
function navigateByUrl (current_url) {
  result = window.location.hash
  number = result.substring(1)
  //if there is no number, display index
  if (number == "") {
    showGalleries(current_url)
  }
  //if the number includes "." then it's an object
  else if (number.includes(".") || number.includes(["A"-"Z"])) {
    showObject(number)
  }
  //otherwise it's a gallery
  else {
    showObjectsTable(number, 0)
  }
}

function showGalleries(url) {
  fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data.info.page == 1) {
      document.querySelector("#galleries").innerHTML += "<h2>Fogg Museum Galleries</h2>"
    }
    data.records.forEach(gallery => {
      document.querySelector("#galleries").innerHTML += `
        <li>
          <a href="#${gallery.id}" onclick="showObjectsTable(${gallery.id}, 1)">
            Gallery #${gallery.id}: ${gallery.name} (Floor ${gallery.floor})
          </a>
        </li>
      `;
    });
    if (data.info.next) {
      showGalleries(data.info.next);
    }
  })
  document.querySelector("#all-galleries").style.display = "block";
  document.querySelector("#all-objects").style.display = "none";
  document.querySelector("#single-object").style.display = "none";
}

function showObjectsTable(gallery_id, page) {
  request = `https://api.harvardartmuseums.org/object?gallery=${gallery_id}&apikey=${API_KEY}&page=${page}`
  fetch(request)
  .then(response => response.json())
  .then(data => {
    if (data.info.page == 1) {
      document.querySelector("#objects").innerHTML += `<h2>Gallery #${gallery_id}</h2>`
    }
      data.records.forEach(object => {
        document.querySelector("#objects").innerHTML += `
        <li>
          <a href="#${object.objectnumber}" onclick="showObject(${object.objectnumber})">
            Object #${object.objectnumber}: ${object.title}
          </a>
            <br>
          <a href="${object.url}">More from the Harvard Art Museums</a>
            <br>
          People: ${getPeople(object)}
            <br>
          ${prepImageDisplay(object)}
            <br>
            <br>
        </li>
        `;
      });
      //make sure you get all pages of data
      //uses page numbers here instead of next url because function was already set up using gallery_id
      if (data.info.page < data.info.pages) {
        showObjectsTable(gallery_id, page + 1);
      }
    })
  document.querySelector("#all-objects").style.display = "block";
  document.querySelector("#all-galleries").style.display = "none";
  document.querySelector("#single-object").style.display = "none";
}

function showObject(object_number) {
  request = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&q=objectnumber:${object_number}`
  fetch(request)
  .then(response => response.json())
  .then(data => {
    if (data.info.page == 1) {
      document.querySelector("#object").innerHTML += `<h2>Object #${object_number}</h2>`
    }
    data.records.forEach(object => {
      //display this info for each object (should be just one)
      document.querySelector("#object").innerHTML += `
        ${prepImageDisplay(object)}
        <li>
          Title: ${fixNull(object.title)}
        </li>
        <li>
          Description: ${fixNull(object.description)}
        </li>
        <li>
          Provenance: ${fixNull(object.provenance)}
        </li>
        <li>
          Accession Year: ${fixNull(object.accessionyear)}
        </li>
      `;
      })
  })
  document.querySelector("#single-object").style.display = "block";
  document.querySelector("#all-objects").style.display = "none";
  document.querySelector("#all-galleries").style.display = "none";
  }


function fixNull(phrase) {
  if (phrase == null) {
    return "None"
  } else return phrase
}

function prepImageDisplay(object) {
  console.log(object)
  //set image properties to null before we check if there is an image to use
  img_src = null
  img_height = null
  img_width = null
  //if there is an image, reset the image properties with info provided
  if (object.images[0]) {
    img_src = object.images[0].baseimageurl
    img_height = object.images[0].height
    img_width = object.images[0].width
  }
  //if there is a url provided, make sure image is an appropriate size for display
  //need to make sure this scales properly
  if (img_src) {
    //and return the line that displays the image
    //height is set so that objects are a good size for display; width adjusted accordingly
    formattedImg = `<img id="ObjectImage" src="${img_src}" height="200">`
    return formattedImg
  } else {
    //otherwise return a message that there are no images
    return "No images availalble for this object.\n"
  }
}

function getPeople(object) {
  //if there are people listed
  let people_list = ""
   if (object.people) {
      object.people.forEach(person => {
        people_list += person.name
      })
    } else {
      people_list = "No people listed for this object."
    }
    return people_list
}








