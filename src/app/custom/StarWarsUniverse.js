import Starship from "./Starship";

export default class StarWarsUniverse {
  constructor() {
    this.starships = [];
  }

  async _getStarshipCount() {
    const starshipsRaw = await fetch("https://swapi.dev/api/starships/");
    const starshipsBody = await starshipsRaw.json();
    return starshipsBody.count;
  }

  async _createStarships() {
    const starshipsRaw = await fetch("https://swapi.dev/api/starships/");
    const starshipsBody = await starshipsRaw.json();
    let resultsArr = [];
    let currentNode = starshipsBody;
    let counter = 0;
    while (counter < starshipsBody.count) {
      currentNode = await (
        await fetch(`https://swapi.dev/api/starships/${counter}/`)
      ).json();

      if (!currentNode.detail) resultsArr.push(currentNode);

      counter++;
    }
    const validated = this._validateData(resultsArr);
    this.starships = validated.map((ship) => {
      const currentShip = new Starship(
        ship.name,
        ship.consumables,
        ship.passengers
      );
      currentShip.parseConsumables();
      currentShip.parsePassengers();
      return currentShip;
    });
    return this.starships;
  }

  _validateCheck([key, x]) {
    const toCheck =
      x && x !== "unknown" && x !== "undefined" && x !== "n/a" && x !== "0";
    return toCheck;
  }

  _validateData(resultsArr) {
    const validated = resultsArr.filter((x) => {
      const values = [
        ["cons", x.consumables],
        ["vals", x.passengers],
      ];
      return values.every(this._validateCheck);
    });
    return validated;
  }

  async init() {
    await this._getStarshipCount();
    await this._createStarships();
  }

  get theBestStarship() {
    let bestShip;
    let bestStarshipDays = 0;
    this.starships.forEach((starship) => {
      if (starship.maxDaysInSpace > bestStarshipDays) {
        bestShip = starship;
        bestStarshipDays = bestShip.maxDaysInSpace;
      }
    });
    const go6o = this.starships
      .sort((a, b) => b.maxDaysInSpace - a.maxDaysInSpace)
      .map((x) => ({ ...x, maxDaysInSpace: x.maxDaysInSpace }));
    return bestShip;
  }
}
