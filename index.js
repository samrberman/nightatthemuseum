const API_KEY = "7657d4b0-b77e-11e8-a4d1-69890776a30b";

document.addEventListener("DOMContentLoaded", () => {
  const url = `https://api.harvardartmuseums.org/gallery?apikey=${API_KEY}`;
  showGalleries(url);
});

function showGalleries(url) {
  fetch(url)
  .then(response => response.json())
  .then(data => {
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
}

function showObjectsTable(gallery_id, page) {
  request = `https://api.harvardartmuseums.org/object?gallery=${gallery_id}&apikey=${API_KEY}&page=${page}`
  fetch(request)
  .then(response => response.json())
  .then(data => {
      console.log(data)
      data.records.forEach(object => {
        document.querySelector("#objects").innerHTML += `
        <li>
          <a href="#${object.id}" onclick="showObject(${object.objectnumber})">
            Object #${object.id}: ${object.title}
            Number: ${object.objectnumber}
          </a>
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
    data.records.forEach(object => {
      //set image properties to null before we check if there is an image to use
      img_src = null
      img_height = null
      img_width = null
      //if there is an image, reset the image properties
      if (object.images.length > 0) {
        img_src = object.images[0].baseimageurl
        img_height = object.images[0].height
        img_width = object.images[0].width
      }
      //display this info for each object (should be just one)
      document.querySelector("#object").innerHTML += `
        <li>
          Object #${object.id}: ${fixNull(object.title)}
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
        <li>
          ${prepImageDisplay(img_src, img_height, img_width)}
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

//this function writes the line that will display the image correctly, then passes it back
//should make it so that this function is passed the image information and parases it within the function itself
function prepImageDisplay(img_src, img_height, img_width) {
  //if image source url is NOT null, create instructions that control how image appears
  if (img_src) {
    formattedImg = `<img id="ObjectImage" src="${img_src}" width="${img_width}" height="${img_height}">`
    return formattedImg
  }
  //otherwise (if null) do nothing
  else {
    return "No images available for this object."
  }
}





