// Shared demo pet data used across the site. PETS is the default seed catalog;
// getAnimals()/saveAnimals() give the admin Animals page a persistent (localStorage)
// copy that every page reads from, so admin add/edit/delete actions are reflected
// site-wide without a backend.

const PETS = [
  { id: "mateus", name: "Mateus", species: "dog", emoji: "🐶", img: "img/Adopt/Mateus.png", breed: "Golden Retriever", age: 2, size: "large", gender: "male", tag: "New", available: true, desc: "Mateus is a playful, affectionate Golden Retriever who loves long walks, fetch, and belly rubs. He's great with kids and other dogs, and already knows sit, stay, and paw." },
  { id: "biscuit", name: "Biscuit", species: "rabbit", emoji: "🐰", img: "img/Adopt/Biscuit.png", breed: "Lop-Eared", age: 0.7, size: "small", gender: "male", tag: "New", available: true, desc: "Biscuit is a gentle lop-eared rabbit who enjoys quiet company and fresh greens. He's litter-trained and does best in a calm, low-traffic home." },
  { id: "mochi", name: "Mochi", species: "cat", emoji: "🐱", img: "img/Adopt/Mochi.png", breed: "Tabby", age: 1.5, size: "medium", gender: "female", tag: "Popular", available: true, desc: "Mochi is a curious tabby cat with a soft spot for sunny windowsills and cardboard boxes. Independent but affectionate, she'll happily curl up on your lap after a day of play." },
  { id: "shiba", name: "Shiba", species: "dog", emoji: "🐶", img: "img/Adopt/Shiba.png", breed: "Shiba Inu", age: 3, size: "medium", gender: "male", tag: "Urgent", available: true, desc: "Shiba is a confident, alert companion who loves exploring the outdoors. He's house-trained and does best with an experienced, active owner." },
  { id: "eddy", name: "Eddy", species: "dog", emoji: "🐶", img: "img/Adopt/Eddy.png", breed: "Beagle Mix", age: 4, size: "medium", gender: "male", tag: "", available: true, desc: "Eddy is a friendly beagle mix with a great nose for adventure. He gets along with everyone and loves a good sniff around the yard." },
  { id: "cloty", name: "Cloty", species: "rabbit", emoji: "🐰", img: "img/Adopt/Cloty.png", breed: "Dutch Rabbit", age: 1, size: "small", gender: "female", tag: "", available: true, desc: "Cloty is a sweet, social dutch rabbit who loves hopping around supervised playtime and nibbling on herbs." },
  { id: "luna", name: "Luna", species: "cat", emoji: "🐱", img: "img/Adopt/Luna.png", breed: "Siamese", age: 2, size: "medium", gender: "female", tag: "Popular", available: true, desc: "Luna is a vocal, people-oriented Siamese who will happily narrate your entire day. She loves interactive toys and warm laps." },
  { id: "rocky", name: "Rocky", species: "dog", emoji: "🐶", img: "img/Adopt/Rocky.png", breed: "Bulldog", age: 5, size: "large", gender: "male", tag: "", available: false, desc: "Rocky is a laid-back bulldog who is content with short walks and long naps. Perfect for a relaxed household." },
  { id: "hazel", name: "Hazel", species: "rabbit", emoji: "🐰", img: "img/Adopt/Hazel.png", breed: "Mini Rex", age: 1.2, size: "small", gender: "female", tag: "New", available: true, desc: "Hazel is an energetic mini rex who loves toys she can toss and chase. She's bonded well with other rabbits in foster care." },
];

function getAnimals() {
  const stored = localStorage.getItem("pp_animals");
  if (stored) return JSON.parse(stored);
  const seeded = JSON.parse(JSON.stringify(PETS));
  localStorage.setItem("pp_animals", JSON.stringify(seeded));
  return seeded;
}

function saveAnimals(list) {
  localStorage.setItem("pp_animals", JSON.stringify(list));
}

function addAnimal(animal) {
  const list = getAnimals();
  list.push(animal);
  saveAnimals(list);
}

function updateAnimal(id, changes) {
  const list = getAnimals();
  const animal = list.find((a) => a.id === id);
  if (animal) Object.assign(animal, changes);
  saveAnimals(list);
}

function deleteAnimal(id) {
  const list = getAnimals().filter((a) => a.id !== id);
  saveAnimals(list);
}
