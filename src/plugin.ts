import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { CombinedDisplayAction } from "./actions/combined-display";
import { SevenDayDisplayAction } from "./actions/seven-day-display";
import { FiveHourDisplayAction } from "./actions/five-hour-display";

streamDeck.logger.setLevel(LogLevel.DEBUG);

streamDeck.actions.registerAction(new CombinedDisplayAction());
streamDeck.actions.registerAction(new SevenDayDisplayAction());
streamDeck.actions.registerAction(new FiveHourDisplayAction());

streamDeck.connect();
