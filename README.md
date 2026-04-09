# Incolae Terrae
Author: Will Geister

Frontend Engineer: Will Geister

Frontend Designer: Will Geister

Backend Engineer: Will Geister

#### Intro
My friends were sad that board games that are typically easy to add players to (i.e. purchase cheap packs of pieces) are not as easy to add players to on their online versions. This is despite the fact that it is as simple as setting player counts to not be bounded, yet these online versions often charge **higher prices** than their physical counterparts.

I made the remark that "I can build a game in 6 months that is better than this, and I will do it for free." This game is exactly that, all code has been written exclusively by me (except clearly demarkated areas that I had AI write serializers etc) and it is free to host. Additionally hosting will *always* be free, insofar as the host is willing to host the server on their own compute space (a la minecraft java edition).

#### Basic Architecture
This game works on a turn based engine that is run exclusively on the backend game server, developed specifically for this game by Will Geister. Player turn information, connection information, etc comes from REST calls and Signlr calls via the front/backends depending on the flow of information.

This drawing is how the backend imagines the game board, and is theoretically going to be scalable to any sized map and shaped map, or maps with additional resorce types, etc.
<img width="920" height="892" alt="TileAssociation" src="https://github.com/user-attachments/assets/832ed6b1-5ed7-4b4c-9729-3fb2ef90cc2e" />

#### Additional help
**Code Reviewers**
Javascript Expert: Brian Lin

Server Based Compute Expert: Addison Adkin

#### Citations
Inspiration: Catan and associated expansion packs.

Initial test sprites: Skyrim, UW Madison Friends of the Arboretum, Getty Stock Images
