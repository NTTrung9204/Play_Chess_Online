const list_name_room = [
    "Chat",
    "Play",
    "Quiz",
    "Lounge",
    "Study",
    "Art",
    "Game",
    "Gym",
    "Tech",
    "Music",
    "Books",
    "Puzzles",
    "Work",
    "Mind",
    "Ideas",
    "Skills",
    "Code",
    "Lab",
    "Chess",
    "Relax",
];

class getRandom {
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getNameRoom() {
        const index_name = this.getRandomNumber(0, list_name_room.length - 1);
        const name = list_name_room[index_name];

        const number_room = this.getRandomNumber(0, 100);

        return `${name} ${number_room}`;
    }
}

module.exports = new getRandom();
