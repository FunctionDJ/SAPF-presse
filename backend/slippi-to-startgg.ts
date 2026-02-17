import pkg from "@slippi/slippi-js/node";

const { Character, Stage } = pkg;

/**
 * slippi character mapping:
 * 
 *         {
          "id": 1,
          "name": "Bowser"
        },
        {
          "id": 2,
          "name": "Captain Falcon"
        },
        {
          "id": 3,
          "name": "Donkey Kong"
        },
        {
          "id": 4,
          "name": "Dr. Mario"
        },
        {
          "id": 5,
          "name": "Falco"
        },
        {
          "id": 6,
          "name": "Fox"
        },
        {
          "id": 7,
          "name": "Ganondorf"
        },
        {
          "id": 8,
          "name": "Ice Climbers"
        },
        {
          "id": 9,
          "name": "Jigglypuff"
        },
        {
          "id": 10,
          "name": "Kirby"
        },
        {
          "id": 11,
          "name": "Link"
        },
        {
          "id": 12,
          "name": "Luigi"
        },
        {
          "id": 13,
          "name": "Mario"
        },
        {
          "id": 14,
          "name": "Marth"
        },
        {
          "id": 15,
          "name": "Mewtwo"
        },
        {
          "id": 16,
          "name": "Mr. Game & Watch"
        },
        {
          "id": 17,
          "name": "Ness"
        },
        {
          "id": 18,
          "name": "Peach"
        },
        {
          "id": 19,
          "name": "Pichu"
        },
        {
          "id": 20,
          "name": "Pikachu"
        },
        {
          "id": 21,
          "name": "Roy"
        },
        {
          "id": 22,
          "name": "Samus"
        },
        {
          "id": 23,
          "name": "Sheik"
        },
        {
          "id": 24,
          "name": "Yoshi"
        },
        {
          "id": 25,
          "name": "Young Link"
        },
        {
          "id": 26,
          "name": "Zelda"
        },
        {
          "id": 628,
          "name": "Sheik / Zelda"
        },
        {
          "id": 1744,
          "name": "Random Character"
        }
 */

/**
 * reference query on startgg:
 * 
 * query characters {
		videogame(slug: "melee") {
			characters {
				id
				name
			}
			stages {
				id
				name
			}
		}
	}
*/

export const slippiCharacterToStartGGCharacter = (
	slippiCharacter: number | undefined,
) => {
	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (slippiCharacter) {
		case Character.BOWSER:
			return 1;
		case Character.CAPTAIN_FALCON:
			return 2;
		case Character.DONKEY_KONG:
			return 3;
		case Character.DR_MARIO:
			return 4;
		case Character.FALCO:
			return 5;
		case Character.FOX:
			return 6;
		case Character.GANONDORF:
			return 7;
		case Character.ICE_CLIMBERS:
			return 8;
		case Character.JIGGLYPUFF:
			return 9;
		case Character.KIRBY:
			return 10;
		case Character.LINK:
			return 11;
		case Character.LUIGI:
			return 12;
		case Character.MARIO:
			return 13;
		case Character.MARTH:
			return 14;
		case Character.MEWTWO:
			return 15;
		case Character.GAME_AND_WATCH:
			return 16;
		case Character.NESS:
			return 17;
		case Character.PEACH:
			return 18;
		case Character.PICHU:
			return 19;
		case Character.PIKACHU:
			return 20;
		case Character.ROY:
			return 21;
		case Character.SAMUS:
			return 22;
		case Character.SHEIK:
			return 23;
		case Character.YOSHI:
			return 24;
		case Character.YOUNG_LINK:
			return 25;
		case Character.ZELDA:
			return 26;
		default:
			return null;
	}
};

/**
 * start.gg stage mapping (for melee):
 * 
 *      "stages": [
        {
          "id": 1,
          "name": "Mushroom Kingdom"
        },
        {
          "id": 2,
          "name": "Princess Peach's Castle"
        },
        {
          "id": 3,
          "name": "Rainbow Cruise"
        },
        {
          "id": 4,
          "name": "Yoshi's Island"
        },
        {
          "id": 5,
          "name": "Yoshi's Story"
        },
        {
          "id": 6,
          "name": "Kongo Jungle"
        },
        {
          "id": 7,
          "name": "Jungle Japes"
        },
        {
          "id": 8,
          "name": "Great Bay"
        },
        {
          "id": 9,
          "name": "Temple"
        },
        {
          "id": 10,
          "name": "Brinstar"
        },
        {
          "id": 11,
          "name": "Fountain of Dreams"
        },
        {
          "id": 12,
          "name": "Green Greens"
        },
        {
          "id": 13,
          "name": "Corneria"
        },
        {
          "id": 14,
          "name": "Venom"
        },
        {
          "id": 15,
          "name": "Pokémon Stadium"
        },
        {
          "id": 16,
          "name": "Mute City"
        },
        {
          "id": 17,
          "name": "Onett"
        },
        {
          "id": 18,
          "name": "Icicle Mountain"
        },
        {
          "id": 19,
          "name": "Battlefield"
        },
        {
          "id": 20,
          "name": "Final Destination"
        },
        {
          "id": 21,
          "name": "Mushroom Kingdom II"
        },
        {
          "id": 22,
          "name": "Yoshi's Island 64"
        },
        {
          "id": 23,
          "name": "Kongo Jungle 64"
        },
        {
          "id": 24,
          "name": "Brinstar Depths"
        },
        {
          "id": 25,
          "name": "Dream Land"
        },
        {
          "id": 26,
          "name": "Poké Floats"
        },
        {
          "id": 27,
          "name": "Big Blue"
        },
        {
          "id": 28,
          "name": "Fourside"
        },
        {
          "id": 29,
          "name": "Flat Zone"
        }
 */

export const slippiStageToStartGGStageId = (
	slippiStage: number | undefined,
): number | null => {
	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (slippiStage) {
		case Stage.MUSHROOM_KINGDOM:
			return 1;
		case Stage.PEACHS_CASTLE:
			return 2;
		case Stage.RAINBOW_CRUISE:
			return 3;
		case Stage.YOSHIS_ISLAND:
			return 4;
		case Stage.YOSHIS_STORY:
			return 5;
		case Stage.KONGO_JUNGLE:
			return 6;
		case Stage.JUNGLE_JAPES:
			return 7;
		case Stage.GREAT_BAY:
			return 8;
		case Stage.HYRULE_TEMPLE:
			return 9;
		case Stage.BRINSTAR:
			return 10;
		case Stage.FOUNTAIN_OF_DREAMS:
			return 11;
		case Stage.GREEN_GREENS:
			return 12;
		case Stage.CORNERIA:
			return 13;
		case Stage.VENOM:
			return 14;
		case Stage.POKEMON_STADIUM:
			return 15;
		case Stage.MUTE_CITY:
			return 16;
		case Stage.ONETT:
			return 17;
		case Stage.ICICLE_MOUNTAIN:
			return 18;
		case Stage.BATTLEFIELD:
			return 19;
		case Stage.FINAL_DESTINATION:
			return 20;
		case Stage.MUSHROOM_KINGDOM_2:
			return 21;
		case Stage.YOSHIS_ISLAND_N64:
			return 22;
		case Stage.KONGO_JUNGLE_N64:
			return 23;
		case Stage.BRINSTAR_DEPTHS:
			return 24;
		case Stage.DREAMLAND:
			return 25;
		case Stage.POKE_FLOATS:
			return 26;
		case Stage.BIG_BLUE:
			return 27;
		case Stage.FOURSIDE:
			return 28;
		case Stage.FLAT_ZONE:
			return 29;
		default:
			return null;
	}
};
