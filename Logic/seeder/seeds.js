const peoplePictures = {
  1: 'https://th.bing.com/th/id/OIP.8_HvWJEZbwr3hkUuZL0jMgAAAA?rs=1&pid=ImgDetMain',
  2: 'https://tse4.mm.bing.net/th/id/OIP.oc1jS8YijLvwPBfKRfsJUgHaHa?rs=1&pid=ImgDetMain',
  3: 'https://static.vecteezy.com/system/resources/thumbnails/037/983/656/small_2x/ai-generated-confident-brunette-business-woman-student-with-folded-arms-photo.jpg',
  4: 'https://tse4.mm.bing.net/th/id/OIP.tHqgBxygPpSN7tCrxYw0PwHaK5?rs=1&pid=ImgDetMain'
};

const dogPictures = {
  golden: 'https://th.bing.com/th/id/OIP.kAMCjX7G_1inCivhWgX_7QHaHN?w=194&h=189&c=7&r=0&o=5&pid=1.7',
  poodle: 'https://th.bing.com/th/id/OIP.aO3Li7pGawt1Uy6Q3hosmgHaE8?w=288&h=192&c=7&r=0&o=5&pid=1.7',
  bulldog: 'https://th.bing.com/th/id/OIP.lpuvsAQDLol67UXmwc37EQHaJ4?w=191&h=180&c=7&r=0&o=5&pid=1.7',
  brown: 'https://tse2.mm.bing.net/th/id/OIP.UBSv4za3R3ZFj2X9M8fqywHaEK?rs=1&pid=ImgDetMain',
  husky: 'https://th.bing.com/th/id/OIP.9KC-w1OERHApExi3PEn2VwHaFS?rs=1&pid=ImgDetMain',
  chihuahua: 'https://th.bing.com/th/id/OIP.0UITqlC1iNLwEa-Yr-JM7QHaFP?rs=1&pid=ImgDetMain',
  lab: 'https://tse2.mm.bing.net/th/id/OIP.yxMbmHl7HDgEPqCSQd3DZwHaEW?rs=1&pid=ImgDetMain',
  dalmatian: 'https://tse4.mm.bing.net/th/id/OIP.LJI1EcXSCoLpbRM0BDE0JwHaE7?rs=1&pid=ImgDetMain'
};

function owner(name, password, picture) {
  return {
    object: 'Owner',
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '_')}@gmail.com`,
    password,
    picture: peoplePictures[picture]
  };
}

function dog(name, picture, traded = false) {
  return {
    object: 'Dog',
    name,
    picture: dogPictures[picture],
    traded
  };
}

module.exports = [
  owner('Ryan', '444421', 1),
    dog('Jamool', 'golden', false),
    dog('Shamool', 'poodle', true),

  owner('Aaron', '223121212', 2),
    dog('Cupcake', 'bulldog', true),
    dog('Rocket', 'husky', false),

  owner('Sarah', 'afa655a5', 3),
    dog('Roofus', 'brown', false),
    dog('Penny', 'dalmatian', true),

  owner('Gary', 'Aaaaa22222', 1),
    dog('Zipper', 'chihuahua', false),

  owner('Maurice', 'ZXCVB123', 2),
    dog('Maximus', 'lab', true),

  owner('Laura', '0987654', 3),
    dog('Muffin', 'poodle', false),

  owner('Frank', '5%5%123', 2),
    dog('Sarge', 'bulldog', true),

  owner('Miranda', '!!!!!Abc', 4),
    dog('Peanut', 'chihuahua', false)
];
