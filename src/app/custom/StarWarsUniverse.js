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
    let resultsArr = [...starshipsBody.results];
    let currentNode = starshipsBody;
    while (currentNode.next) {
      currentNode = await (await fetch(currentNode.next)).json();
      resultsArr = [...resultsArr, ...currentNode.results];
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
    console.log(resultsArr);
    console.log(this.starships);
    return this.starships;
  }

  _validateData(resultsArr) {
    const validated = resultsArr.filter((x) => {
      return (
        x.consumables !== "unknown" &&
        x.consumables !== "undefined" &&
        x.consumables &&
        x.passengers !== "0" &&
        x.passengers !== "n/a" &&
        x.passengers !== "undefined" &&
        x.passengers !== "unknown" &&
        x.passengers
      );
    });
    console.log(validated, "validirani");
    return validated;
  }

  async init() {
    //from task 3
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
    return bestShip;
  }
}
