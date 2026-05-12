import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── DATA ─────────────────────────────────────────────────────────────────────
// Each entry has: country (country of birth, clean string) and genre (primary photographic tradition)
// Genres: Street · Documentary · Portrait · Landscape · Fashion · Fine Art · War · Conceptual · Experimental
const PHOTOGRAPHERS = {
  // ── ROOTS (born before 1880) ────────────────────────────────────────────────
  "nadar":                  { name: "Nadar",                   born: 1820, years: "1820–1910", nationality: "French",            country: "France",        genre: "Portrait",     style: "Portrait · Aerial",             bio: "Pioneered modern portrait photography and made the first aerial photographs from a balloon.", influences: [], links: { website: "https://www.metmuseum.org/art/collection/search#!?q=nadar", book: "https://www.amazon.com/s?k=nadar+photography" } },
  "julia-margaret-cameron": { name: "Julia Margaret Cameron",  born: 1815, years: "1815–1879", nationality: "British",           country: "UK",            genre: "Portrait",     style: "Pictorialism · Portrait",       bio: "Victorian pioneer who made photography a vehicle for art. Her blurred soft-focus portraits redefined portraiture.", influences: [], links: { website: "https://www.vam.ac.uk/articles/julia-margaret-cameron", book: "https://www.amazon.com/s?k=julia+margaret+cameron+photography" } },
  "eugene-atget":           { name: "Eugène Atget",            born: 1857, years: "1857–1927", nationality: "French",            country: "France",        genre: "Documentary", style: "Documentary · Urban",           bio: "Documented Paris streets obsessively for decades. Surrealist icon discovered late in life.", influences: [], links: { website: "https://www.moma.org/artists/229", book: "https://www.amazon.com/s?k=eugene+atget" } },
  "alfred-stieglitz":       { name: "Alfred Stieglitz",        born: 1864, years: "1864–1946", nationality: "American",            country: "USA",        genre: "Fine Art"    ,          style: "Pictorialism · Modernism",      bio: "Pioneer who elevated photography to fine art. Founded Photo-Secession and gallery 291.", influences: ["nadar"], links: { website: "https://www.metmuseum.org/art/collection/search#!?q=stieglitz", book: "https://www.amazon.com/s?k=alfred+stieglitz" } },
  "gertrude-kasebier":      { name: "Gertrude Käsebier",       born: 1852, years: "1852–1934", nationality: "American",            country: "USA",        genre: "Portrait"    ,          style: "Pictorialism · Portrait",       bio: "One of the most important women photographers of the early 20th century. Fought to establish photography as fine art.", influences: ["nadar"], links: { website: "https://www.metmuseum.org/art/collection/search#!?q=kasebier", book: "https://www.amazon.com/s?k=gertrude+kasebier" } },
  "edward-steichen":        { name: "Edward Steichen",         born: 1879, years: "1879–1973", nationality: "American",            country: "USA",        genre: "Fashion"    ,          style: "Pictorialism · Fashion",        bio: "Father of modern fashion photography. Before WWII he was the world's highest-paid photographer. Curated The Family of Man.", influences: ["alfred-stieglitz"], links: { website: "https://www.moma.org/artists/5632", book: "https://www.amazon.com/s?k=edward+steichen" } },

  // ── MODERNIST ERA (1880–1910) ───────────────────────────────────────────────
  "paul-strand":            { name: "Paul Strand",             born: 1890, years: "1890–1976", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Straight Photography",          bio: "Pioneered straight photography, rejecting pictorialist manipulation for direct seeing.", influences: ["alfred-stieglitz"], links: { book: "https://www.amazon.com/s?k=paul+strand" } },
  "edward-weston":          { name: "Edward Weston",           born: 1886, years: "1886–1958", nationality: "American",            country: "USA",        genre: "Fine Art"    ,          style: "Fine Art · Modernism",          bio: "Transformed natural forms — peppers, shells, nudes — into abstract sculpture. A master of light and detail.", influences: ["alfred-stieglitz", "paul-strand"], links: { website: "https://www.edward-weston.com", book: "https://www.amazon.com/s?k=edward+weston+photography" } },
  "imogen-cunningham":      { name: "Imogen Cunningham",       born: 1883, years: "1883–1976", nationality: "American",            country: "USA",        genre: "Fine Art"    ,          style: "Fine Art · Botanical",          bio: "Botanicals, nudes, and industrial forms with precision and tenderness. Member of Group f/64.", influences: ["gertrude-kasebier", "alfred-stieglitz"], links: { website: "https://www.imogencunningham.com", book: "https://www.amazon.com/s?k=imogen+cunningham" } },
  "berenice-abbott":        { name: "Berenice Abbott",         born: 1898, years: "1898–1991", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Urban",           bio: "Documented New York's transformation in the 1930s, inspired by her mentor Atget's systematic vision of Paris.", influences: ["eugene-atget"], links: { website: "https://www.moma.org/artists/26", book: "https://www.amazon.com/s?k=berenice+abbott" } },
  "man-ray":                { name: "Man Ray",                 born: 1890, years: "1890–1976", nationality: "American",            country: "USA",        genre: "Experimental"    ,          style: "Surrealism · Experimental",     bio: "Surrealist provocateur who weaponised photography as anti-art. Invented the rayograph and solarisation.", influences: ["alfred-stieglitz"], links: { website: "https://www.manray.net", book: "https://www.amazon.com/s?k=man+ray+photography" } },
  "tina-modotti":           { name: "Tina Modotti",            born: 1896, years: "1896–1942", nationality: "Italian-Mexican",            country: "Italy",        genre: "Documentary"    ,   style: "Documentary · Political",       bio: "Italian-born photographer of revolutionary Mexico. Merged radical politics with luminous formal beauty.", influences: ["edward-weston"], links: { website: "https://www.moma.org/artists/4048", book: "https://www.amazon.com/s?k=tina+modotti+photography" } },
  "dorothea-lange":         { name: "Dorothea Lange",          born: 1895, years: "1895–1965", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Social",          bio: "Defined social documentary photography during the Great Depression. Migrant Mother.", influences: ["alfred-stieglitz"], links: { website: "https://www.moma.org/artists/3373", book: "https://www.amazon.com/s?k=dorothea+lange" } },
  "margaret-bourke-white":  { name: "Margaret Bourke-White",   born: 1904, years: "1904–1971", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Photojournalism · Industrial",  bio: "First female war correspondent, first Western photographer in the Soviet Union. Life magazine's pioneering icon.", influences: ["alfred-stieglitz", "edward-steichen"], links: { website: "https://www.moma.org/artists/770", book: "https://www.amazon.com/s?k=margaret+bourke+white" } },

  // ── MID 20TH CENTURY (1895–1920) ────────────────────────────────────────────
  "weegee":                 { name: "Weegee",                  born: 1899, years: "1899–1968", nationality: "American",            country: "USA",        genre: "Street"    ,          style: "Crime · Street",                bio: "Tabloid photographer whose raw flash-lit images defined New York's urban underworld.", influences: [], links: { book: "https://www.amazon.com/s?k=weegee+photography" } },
  "lisette-model":          { name: "Lisette Model",           born: 1901, years: "1901–1983", nationality: "Austrian-American",            country: "Austria",        genre: "Street"    , style: "Street · Portrait",             bio: "Mentor to Diane Arbus. Bold, confrontational portraits of society's margins.", influences: [], links: { book: "https://www.amazon.com/s?k=lisette+model" } },
  "ansel-adams":            { name: "Ansel Adams",             born: 1902, years: "1902–1984", nationality: "American",            country: "USA",        genre: "Landscape"    ,          style: "Landscape · Fine Art",          bio: "Master of black-and-white landscape photography. Invented the Zone System.", influences: ["alfred-stieglitz", "paul-strand"], links: { website: "https://anseladams.com", book: "https://www.amazon.com/s?k=ansel+adams" } },
  "walker-evans":           { name: "Walker Evans",            born: 1903, years: "1903–1975", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Social",          bio: "Defined documentary photography's visual language. 'Let Us Now Praise Famous Men'.", influences: ["eugene-atget", "alfred-stieglitz"], links: { website: "https://www.moma.org/artists/1777", book: "https://www.amazon.com/s?k=walker+evans" } },
  "robert-capa":            { name: "Robert Capa",             born: 1913, years: "1913–1954", nationality: "Hungarian-American",            country: "Hungary",        genre: "War"    , style: "War · Photojournalism",         bio: "The greatest war photographer in history. D-Day, the Spanish Civil War, the decisive risk.", influences: ["henri-cartier-bresson"], links: { website: "https://www.magnumphotos.com/photographer/robert-capa/", book: "https://www.amazon.com/s?k=robert+capa+photography" } },
  "brassai":                { name: "Brassaï",                 born: 1899, years: "1899–1984", nationality: "Hungarian-French",            country: "Hungary",        genre: "Street"    ,  style: "Street · Nocturnal",            bio: "Photographer of Paris by night. His underworld of cafés, prostitutes, and fog is wholly his own.", influences: ["eugene-atget"], links: { website: "https://www.moma.org/artists/766", book: "https://www.amazon.com/s?k=brassai+photography" } },
  "henri-cartier-bresson":  { name: "Henri Cartier-Bresson",  born: 1908, years: "1908–2004", nationality: "French",            country: "France",        genre: "Street"    ,            style: "Street · Photojournalism",      bio: "Father of modern photojournalism. Coined 'the decisive moment'. Co-founded Magnum.", influences: ["paul-strand", "eugene-atget"], links: { website: "https://www.henricartierbresson.org", book: "https://www.amazon.com/s?k=henri+cartier-bresson" } },
  "gordon-parks":           { name: "Gordon Parks",            born: 1912, years: "1912–2006", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Portrait",        bio: "First Black staff photographer at Life magazine. Chronicled civil rights with humanity.", influences: ["dorothea-lange", "walker-evans"], links: { website: "https://www.gordonparksfoundation.org", book: "https://www.amazon.com/s?k=gordon+parks" } },
  "w-eugene-smith":         { name: "W. Eugene Smith",         born: 1918, years: "1918–1978", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Photojournalism · Essay",       bio: "Pioneer of the photo-essay as art form. Minamata is one of the most powerful bodies of documentary work ever made.", influences: ["dorothea-lange", "margaret-bourke-white"], links: { website: "https://www.magnumphotos.com/photographer/w-eugene-smith/", book: "https://www.amazon.com/s?k=w+eugene+smith+photography" } },
  "yousuf-karsh":           { name: "Yousuf Karsh",            born: 1908, years: "1908–2002", nationality: "Armenian-Canadian",            country: "Armenia",        genre: "Portrait"    , style: "Portrait",                      bio: "The most celebrated portrait photographer of the 20th century. Churchill, Einstein, Hemingway — all rendered iconic.", influences: ["edward-steichen"], links: { website: "https://karsh.org", book: "https://www.amazon.com/s?k=yousuf+karsh+photography" } },
  "helmut-newton":          { name: "Helmut Newton",           born: 1920, years: "1920–2004", nationality: "German-Australian",            country: "Germany",        genre: "Fashion"    , style: "Fashion · Erotic",              bio: "Provocateur of fashion photography. Charged, controversial, entirely his own vision.", influences: ["weegee", "edward-steichen"], links: { website: "https://www.helmut-newton.com", book: "https://www.amazon.com/s?k=helmut+newton" } },
  "irving-penn":            { name: "Irving Penn",             born: 1917, years: "1917–2009", nationality: "American",            country: "USA",        genre: "Fashion"    ,          style: "Fashion · Portrait",            bio: "Technical master of studio photography. Five decades of Vogue covers that defined visual elegance.", influences: ["edward-steichen", "edward-weston"], links: { website: "https://www.irvingpenn.org", book: "https://www.amazon.com/s?k=irving+penn+photography" } },
  "richard-avedon":         { name: "Richard Avedon",          born: 1923, years: "1923–2004", nationality: "American",            country: "USA",        genre: "Portrait"    ,          style: "Portrait · Fashion",            bio: "Redefined portraiture with white backgrounds and radical intimacy. In the American West is an American monument.", influences: ["irving-penn", "lisette-model"], links: { website: "https://www.avedonfoundation.org", book: "https://www.amazon.com/s?k=richard+avedon+photography" } },
  "sergio-larrain":         { name: "Sergio Larraín",          born: 1931, years: "1931–2012", nationality: "Chilean",            country: "Chile",        genre: "Street"    ,           style: "Street · Poetic",               bio: "Chile's greatest photographer. Withdrew from the world in the 1970s; his street images endure as poetry.", influences: ["henri-cartier-bresson"], links: { website: "https://www.magnumphotos.com/photographer/sergio-larrain/", book: "https://www.amazon.com/s?k=sergio+larrain+photography" } },

  // ── POST-WAR GENERATION (1920–1940) ─────────────────────────────────────────
  "diane-arbus":            { name: "Diane Arbus",             born: 1923, years: "1923–1971", nationality: "American",            country: "USA",        genre: "Portrait"    ,          style: "Portrait · Documentary",        bio: "Explored marginalised communities with unflinching intimacy and compassion.", influences: ["lisette-model", "weegee"], links: { website: "https://www.moma.org/artists/255", book: "https://www.amazon.com/s?k=diane+arbus" } },
  "robert-frank":           { name: "Robert Frank",            born: 1924, years: "1924–2019", nationality: "Swiss-American",            country: "Switzerland",        genre: "Street"    ,    style: "Street · Documentary",          bio: "'The Americans' changed photography forever. Raw, personal, anti-establishment vision.", influences: ["henri-cartier-bresson", "weegee"], links: { website: "https://www.moma.org/artists/1973", book: "https://www.amazon.com/s?k=robert+frank" } },
  "william-klein":          { name: "William Klein",           born: 1926, years: "1926–2022", nationality: "American-French",            country: "USA",        genre: "Street"    ,   style: "Street · Fashion",              bio: "Radical street photographer. Wide-angle chaos. The anti–Cartier-Bresson.", influences: ["weegee"], links: { book: "https://www.amazon.com/s?k=william+klein" } },
  "vivian-maier":           { name: "Vivian Maier",            born: 1926, years: "1926–2009", nationality: "American",            country: "USA",        genre: "Street"    ,          style: "Street",                        bio: "Shot 150,000 frames in secret. Discovered posthumously. Photography's greatest mystery.", influences: ["henri-cartier-bresson", "lisette-model"], links: { website: "https://www.vivianmaier.com", book: "https://www.amazon.com/s?k=vivian+maier" } },
  "garry-winogrand":        { name: "Garry Winogrand",         born: 1928, years: "1928–1984", nationality: "American",            country: "USA",        genre: "Street"    ,          style: "Street",                        bio: "Restless chronicler of American life. Left 2,500 undeveloped rolls at his death.", influences: ["henri-cartier-bresson", "weegee"], links: { website: "https://www.moma.org/artists/6476", book: "https://www.amazon.com/s?k=garry+winogrand" } },
  "elliott-erwitt":         { name: "Elliott Erwitt",          born: 1928, years: "1928–2023", nationality: "French-American",            country: "France",        genre: "Street"    ,   style: "Street · Humor",                bio: "Master of irony and wit in photography. Dogs, humans, and the absurdity of the everyday.", influences: ["henri-cartier-bresson", "robert-frank"], links: { website: "https://www.elliotterwitt.com", book: "https://www.amazon.com/s?k=elliott+erwitt+photography" } },
  "don-mcccullin":          { name: "Don McCullin",            born: 1935, years: "1935–",     nationality: "British",            country: "UK",        genre: "War"    ,           style: "War · Documentary",             bio: "Britain's greatest war photographer. Cyprus, Vietnam, Biafra — McCullin went where no one else dared.", influences: ["w-eugene-smith", "robert-capa"], links: { website: "https://www.donmccullin.co.uk", book: "https://www.amazon.com/s?k=don+mccullin+photography" } },
  "lee-friedlander":        { name: "Lee Friedlander",         born: 1934, years: "1934–",     nationality: "American",            country: "USA",        genre: "Street"    ,          style: "Street · Social Landscape",     bio: "Inventive formalist of American street photography. Reflections, shadows, complexity.", influences: ["walker-evans", "weegee"], links: { website: "https://www.moma.org/artists/1946", book: "https://www.amazon.com/s?k=lee+friedlander" } },
  "joel-meyerowitz":        { name: "Joel Meyerowitz",         born: 1938, years: "1938–",     nationality: "American",            country: "USA",        genre: "Street"    ,          style: "Street · Color",                bio: "Pioneered color street photography in New York. Cape Light is a landmark in color photography.", influences: ["robert-frank", "garry-winogrand"], links: { website: "https://www.joelmeyerowitz.com", instagram: "https://www.instagram.com/joelmeyerowitz", book: "https://www.amazon.com/s?k=joel+meyerowitz+photography" } },
  "daido-moriyama":         { name: "Daido Moriyama",          born: 1938, years: "1938–",     nationality: "Japanese",            country: "Japan",        genre: "Street"    ,          style: "Street · Experimental",         bio: "Grain and blur as aesthetic tools. Tokyo's shadow, speed, and erotic energy on film.", influences: ["weegee", "william-klein"], links: { website: "https://www.moriyamadaido.com", instagram: "https://www.instagram.com/moriyamadaido", book: "https://www.amazon.com/s?k=daido+moriyama" } },
  "william-eggleston":      { name: "William Eggleston",       born: 1939, years: "1939–",     nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Color · Everyday Life",         bio: "Legitimised color photography as fine art. The ordinary made extraordinary.", influences: ["henri-cartier-bresson", "weegee"], links: { website: "https://www.egglestontrust.com", book: "https://www.amazon.com/s?k=william+eggleston" } },
  "shomei-tomatsu":         { name: "Shōmei Tōmatsu",          born: 1930, years: "1930–2012", nationality: "Japanese",            country: "Japan",        genre: "Documentary"    ,          style: "Documentary · Post-War",        bio: "Chronicled Japan's traumatic post-war transformation. Nagasaki and the American occupation defined his legacy.", influences: ["weegee", "w-eugene-smith"], links: { website: "https://www.moma.org/artists/5808", book: "https://www.amazon.com/s?k=shomei+tomatsu+photography" } },
  "ernst-haas":             { name: "Ernst Haas",              born: 1921, years: "1921–1986", nationality: "Austrian-American",            country: "Austria",        genre: "Fine Art"    , style: "Color · Abstract",              bio: "First photographer to have a solo exhibition at MoMA. His colour work transformed how photographers thought about light.", influences: ["henri-cartier-bresson", "edward-steichen"], links: { website: "https://www.ernst-haas.com", book: "https://www.amazon.com/s?k=ernst+haas+photography" } },
  "sabine-weiss":           { name: "Sabine Weiss",            born: 1924, years: "1924–2021", nationality: "Swiss-French",            country: "Switzerland",        genre: "Street"    ,      style: "Humanist · Street",             bio: "Last surviving member of the Humanist Photography movement. Her tender street portraits defined post-war French photography.", influences: ["henri-cartier-bresson", "brassai"], links: { book: "https://www.amazon.com/s?k=sabine+weiss+photography" } },

  // ── 1940s–1950s BIRTHS ──────────────────────────────────────────────────────
  "sebastiao-salgado":      { name: "Sebastião Salgado",       born: 1944, years: "1944–",     nationality: "Brazilian",            country: "Brazil",        genre: "Documentary"    ,         style: "Documentary · Humanitarian",    bio: "Epic humanitarian photography spanning workers, refugees, and the Genesis project.", influences: ["dorothea-lange", "henri-cartier-bresson"], links: { website: "https://www.amazonasimages.com", instagram: "https://www.instagram.com/sebastiaosalgado", book: "https://www.amazon.com/s?k=sebastiao+salgado" } },
  "james-nachtwey":         { name: "James Nachtwey",          born: 1948, years: "1948–",     nationality: "American",            country: "USA",        genre: "War"    ,          style: "War · Documentary",             bio: "The most dedicated war photographer alive. His unflinching witness to human suffering is a moral act.", influences: ["w-eugene-smith", "robert-capa"], links: { website: "https://jamesnachtwey.com", book: "https://www.amazon.com/s?k=james+nachtwey+photography" } },
  "stephen-shore":          { name: "Stephen Shore",           born: 1947, years: "1947–",     nationality: "American",            country: "USA",        genre: "Conceptual"    ,          style: "Color · Conceptual",            bio: "Photographed the American vernacular landscape with deadpan precision. Uncommon Places is essential.", influences: ["walker-evans", "william-eggleston"], links: { website: "https://www.stephenshore.net", instagram: "https://www.instagram.com/stephen_shore", book: "https://www.amazon.com/s?k=stephen+shore+photography" } },
  "sally-mann":             { name: "Sally Mann",              born: 1951, years: "1951–",     nationality: "American",            country: "USA",        genre: "Fine Art"    ,          style: "Fine Art · Family",             bio: "Immediate Family made her famous and infamous. Mann's South is gothic, beautiful, and deeply American.", influences: ["edward-weston", "diane-arbus"], links: { website: "https://www.sallymann.com", book: "https://www.amazon.com/s?k=sally+mann+photography" } },
  "martin-parr":            { name: "Martin Parr",             born: 1952, years: "1952–",     nationality: "British",            country: "UK",        genre: "Documentary"    ,           style: "Documentary · Color",           bio: "Satirist of consumer culture and British life. Color, flash, unflinching observation.", influences: ["william-eggleston", "walker-evans"], links: { website: "https://www.martinparr.com", instagram: "https://www.instagram.com/martinparrstudio", book: "https://www.amazon.com/s?k=martin+parr" } },
  "nan-goldin":             { name: "Nan Goldin",              born: 1953, years: "1953–",     nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Intimate",        bio: "'The Ballad of Sexual Dependency' — raw diaristic photography as survival and testimony.", influences: ["diane-arbus", "weegee"], links: { website: "https://www.moma.org/artists/7487", instagram: "https://www.instagram.com/nangoldin1", book: "https://www.amazon.com/s?k=nan+goldin" } },
  "cindy-sherman":          { name: "Cindy Sherman",           born: 1954, years: "1954–",     nationality: "American",            country: "USA",        genre: "Conceptual"    ,          style: "Conceptual · Self-Portrait",    bio: "Constructs elaborate alternate identities through performance, costume, and camera.", influences: ["diane-arbus"], links: { website: "https://www.moma.org/artists/5392", book: "https://www.amazon.com/s?k=cindy+sherman" } },
  "joel-sternfeld":         { name: "Joel Sternfeld",          born: 1944, years: "1944–",     nationality: "American",            country: "USA",        genre: "Landscape"    ,          style: "Color · Landscape",             bio: "American Prospects redefined landscape photography. His large-format color work is wry, sad, and precise.", influences: ["walker-evans", "william-eggleston"], links: { book: "https://www.amazon.com/s?k=joel+sternfeld+photography" } },
  "lee-miller":             { name: "Lee Miller",              born: 1907, years: "1907–1977", nationality: "American",            country: "USA",        genre: "War"    ,          style: "Surrealism · War",              bio: "Surrealist muse turned fearless war photographer. Her images of Dachau's liberation are among the most important ever taken.", influences: ["man-ray", "edward-steichen"], links: { website: "https://www.leemiller.co.uk", book: "https://www.amazon.com/s?k=lee+miller+photography" } },
  "marc-riboud":            { name: "Marc Riboud",             born: 1923, years: "1923–2016", nationality: "French",            country: "France",        genre: "Documentary"    ,            style: "Photojournalism · Travel",      bio: "Magnum photographer who spent decades chronicling Asia with curiosity and grace. The Painter of the Eiffel Tower is iconic.", influences: ["henri-cartier-bresson"], links: { book: "https://www.amazon.com/s?k=marc+riboud+photography" } },
  "mary-ellen-mark":        { name: "Mary Ellen Mark",         born: 1940, years: "1940–2015", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Portrait",        bio: "Spent decades documenting society's margins — sex workers, the homeless, circus performers — with humanity.", influences: ["diane-arbus", "dorothea-lange"], links: { website: "https://www.maryellenmark.com", book: "https://www.amazon.com/s?k=mary+ellen+mark+photography" } },

  // ── 1950s–1960s BIRTHS ──────────────────────────────────────────────────────
  "helmut-newton-fashion":  { name: "Guy Bourdin",             born: 1928, years: "1928–1991", nationality: "French",            country: "France",        genre: "Fashion"    ,            style: "Fashion · Surrealist",          bio: "French Vogue's most radical fashion photographer. Bourdin's images were disturbing, erotic, and entirely cinematic.", influences: ["man-ray", "helmut-newton"], links: { book: "https://www.amazon.com/s?k=guy+bourdin+photography" } },
  "andreas-gursky":         { name: "Andreas Gursky",          born: 1955, years: "1955–",     nationality: "German",            country: "Germany",        genre: "Conceptual"    ,            style: "Conceptual · Large Format",     bio: "Creates vast, digitally-manipulated photographs of globalisation's landscapes. Rhine II sold for $4.3m.", influences: ["stephen-shore", "walker-evans"], links: { website: "https://www.andreasgursky.com", book: "https://www.amazon.com/s?k=andreas+gursky+photography" } },
  "nobuyoshi-araki":        { name: "Nobuyoshi Araki",         born: 1940, years: "1940–",     nationality: "Japanese",            country: "Japan",        genre: "Experimental"    ,          style: "Intimate · Erotic",             bio: "Prolific and controversial chronicler of desire, death, and Tokyo. Over 450 published books.", influences: ["daido-moriyama", "weegee"], links: { book: "https://www.amazon.com/s?k=nobuyoshi+araki+photography" } },
  "carrie-mae-weems":       { name: "Carrie Mae Weems",        born: 1953, years: "1953–",     nationality: "American",            country: "USA",        genre: "Conceptual"    ,          style: "Conceptual · Social",           bio: "The Kitchen Table Series transformed documentary photography into art. Race, gender, family — all examined with intelligence.", influences: ["gordon-parks", "diane-arbus"], links: { website: "https://carriemaeweems.net", book: "https://www.amazon.com/s?k=carrie+mae+weems+photography" } },
  "nick-ut":                { name: "Nick Ut",                 born: 1951, years: "1951–",     nationality: "Vietnamese-American",            country: "Vietnam",        genre: "War"    , style: "Photojournalism · War",        bio: "Napalm Girl (1972) is one of the most important photographs ever taken. It changed public opinion on the Vietnam War.", influences: ["robert-capa", "w-eugene-smith"], links: { book: "https://www.amazon.com/s?k=nick+ut+photography" } },
  "steve-mccurry":          { name: "Steve McCurry",           born: 1950, years: "1950–",     nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Photojournalism · Portrait",    bio: "Afghan Girl is the most recognised image in National Geographic history. McCurry's colour photography is a benchmark.", influences: ["henri-cartier-bresson", "sebastiao-salgado"], links: { website: "https://www.stevemccurry.com", instagram: "https://www.instagram.com/stevemccurry", book: "https://www.amazon.com/s?k=steve+mccurry+photography" } },
  "trent-parke":            { name: "Trent Parke",             born: 1971, years: "1971–",     nationality: "Australian",            country: "Australia",        genre: "Street"    ,        style: "Street · Atmospheric",         bio: "First Australian member of Magnum. His Dream/Life series turned Sydney streets into surreal dreamscapes.", influences: ["daido-moriyama", "robert-frank"], links: { website: "https://www.magnumphotos.com/photographer/trent-parke/", book: "https://www.amazon.com/s?k=trent+parke+photography" } },
  "alec-soth":              { name: "Alec Soth",               born: 1969, years: "1969–",     nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Poetic",          bio: "Sleeping by the Mississippi announced a photographer who makes the American heartland feel mythic and tender.", influences: ["stephen-shore", "joel-sternfeld"], links: { website: "https://alecsoth.com", instagram: "https://www.instagram.com/alecsothstudio", book: "https://www.amazon.com/s?k=alec+soth+photography" } },
  "alex-webb":              { name: "Alex Webb",               born: 1952, years: "1952–",     nationality: "American",            country: "USA",        genre: "Street"    ,          style: "Color · Street",                bio: "Magnum photographer who pushes color and layered composition to their limit. Haiti to Istanbul.", influences: ["henri-cartier-bresson", "william-eggleston"], links: { website: "https://www.magnumphotos.com/photographer/alex-webb/", book: "https://www.amazon.com/s?k=alex+webb+photography" } },
  "graciela-iturbide":      { name: "Graciela Iturbide",       born: 1942, years: "1942–",     nationality: "Mexican",            country: "Mexico",        genre: "Documentary"    ,           style: "Documentary · Surrealist",      bio: "Mexico's greatest photographer. Her images of indigenous communities are strange, dignified, and enduring.", influences: ["manuel-alvarez-bravo", "tina-modotti"], links: { website: "https://www.gracielaiturbide.org", book: "https://www.amazon.com/s?k=graciela+iturbide+photography" } },
  "manuel-alvarez-bravo":   { name: "Manuel Álvarez Bravo",    born: 1902, years: "1902–2002", nationality: "Mexican",            country: "Mexico",        genre: "Documentary"    ,           style: "Surrealism · Documentary",      bio: "The father of Mexican photography. His images fuse surrealism with indigenous culture and revolutionary politics.", influences: ["tina-modotti", "eugene-atget"], links: { website: "https://www.moma.org/artists/246", book: "https://www.amazon.com/s?k=manuel+alvarez+bravo+photography" } },

  // ── CONTEMPORARY (1960s–1980s) ───────────────────────────────────────────────
  "helmut-newton-ii":       { name: "Hiroshi Sugimoto",        born: 1948, years: "1948–",     nationality: "Japanese",            country: "Japan",        genre: "Fine Art"    ,          style: "Conceptual · Minimalist",       bio: "Long-exposure seascapes and theatre photographs that stretch time into near-abstraction. Philosophy as photography.", influences: ["edward-weston", "ansel-adams"], links: { website: "https://www.sugimotohiroshi.com", book: "https://www.amazon.com/s?k=hiroshi+sugimoto+photography" } },
  "wolfgang-tillmans":      { name: "Wolfgang Tillmans",       born: 1968, years: "1968–",     nationality: "German",            country: "Germany",        genre: "Conceptual"    ,            style: "Conceptual · Documentary",      bio: "Blurred boundaries between documentary and abstraction. Turner Prize 2000.", influences: ["nan-goldin", "martin-parr"], links: { website: "https://www.tillmans.co.uk", instagram: "https://www.instagram.com/wolfgangtillmans", book: "https://www.amazon.com/s?k=wolfgang+tillmans" } },
  "rinko-kawauchi":         { name: "Rinko Kawauchi",          born: 1972, years: "1972–",     nationality: "Japanese",            country: "Japan",        genre: "Fine Art"    ,          style: "Fine Art · Poetic",             bio: "Lyrical, light-suffused photography of the everyday. Tenderness as a photographic method.", influences: ["daido-moriyama", "vivian-maier"], links: { website: "https://rinkokawauchi.com", instagram: "https://www.instagram.com/rinkokawauchi", book: "https://www.amazon.com/s?k=rinko+kawauchi" } },
  "taryn-simon":            { name: "Taryn Simon",             born: 1975, years: "1975–",     nationality: "American",            country: "USA",        genre: "Conceptual"    ,          style: "Conceptual · Investigative",    bio: "Photographs hidden systems and invisible infrastructures. An American Index of the Hidden and Unfamiliar.", influences: ["cindy-sherman", "stephen-shore"], links: { website: "https://www.tarynsimon.com", book: "https://www.amazon.com/s?k=taryn+simon+photography" } },
  "gregory-crewdson":       { name: "Gregory Crewdson",        born: 1962, years: "1962–",     nationality: "American",            country: "USA",        genre: "Conceptual"    ,          style: "Cinematic · Staged",            bio: "Cinematic suburban nightmares shot with Hollywood production budgets. Twilight is deeply unsettling.", influences: ["cindy-sherman", "diane-arbus"], links: { website: "https://www.gagosian.com/artists/gregory-crewdson", book: "https://www.amazon.com/s?k=gregory+crewdson+photography" } },
  "richard-misrach":        { name: "Richard Misrach",         born: 1949, years: "1949–",     nationality: "American",            country: "USA",        genre: "Landscape"    ,          style: "Landscape · Environmental",     bio: "Large-format documentation of the American desert and its nuclear wounds. Bravo 20 is both beautiful and horrifying.", influences: ["ansel-adams", "stephen-shore"], links: { book: "https://www.amazon.com/s?k=richard+misrach+photography" } },
  "zanele-muholi":          { name: "Zanele Muholi",           born: 1972, years: "1972–",     nationality: "South African",            country: "South Africa",        genre: "Documentary"    ,     style: "Documentary · Identity",        bio: "Visual activist documenting Black LGBTQI+ lives in South Africa. Somnyama Ngonyama is a declaration of selfhood.", influences: ["carrie-mae-weems", "diane-arbus"], links: { website: "https://www.stevenson.info/artist/zanele-muholi", instagram: "https://www.instagram.com/zanelemuholi", book: "https://www.amazon.com/s?k=zanele+muholi+photography" } },
  "sebastiaan-bremer":      { name: "Boris Mikhailov",         born: 1938, years: "1938–",     nationality: "Ukrainian",            country: "Ukraine",        genre: "Documentary"    ,         style: "Documentary · Social",          bio: "The most important photographer to emerge from the Soviet Union. His unsparing work on post-Soviet collapse is essential.", influences: ["weegee", "diane-arbus"], links: { book: "https://www.amazon.com/s?k=boris+mikhailov+photography" } },
  "eli-reed":               { name: "Eli Reed",                born: 1946, years: "1946–",     nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Social",          bio: "First African American to become a full member of Magnum. His Beirut diary and Benighted in America are benchmarks.", influences: ["gordon-parks", "w-eugene-smith"], links: { book: "https://www.amazon.com/s?k=eli+reed+photography" } },
  "martin-parr-ii":         { name: "Philip-Lorca diCorcia",   born: 1951, years: "1951–",     nationality: "American",            country: "USA",        genre: "Conceptual"    ,          style: "Staged · Street",               bio: "Blurred the line between documentary and fiction. His secretly-strobed street portraits in Times Square are breathtaking.", influences: ["nan-goldin", "stephen-shore"], links: { book: "https://www.amazon.com/s?k=philip+lorca+dicorcia+photography" } },
  "viviane-sassen":         { name: "Viviane Sassen",          born: 1972, years: "1972–",     nationality: "Dutch",            country: "Netherlands",        genre: "Fashion"    ,             style: "Fashion · Fine Art",            bio: "African light, radical cropping, bodies dissolved into shadow. One of the most original fashion photographers working today.", influences: ["helmut-newton", "nan-goldin"], links: { website: "https://www.vivianesassen.com", instagram: "https://www.instagram.com/vivianesassen", book: "https://www.amazon.com/s?k=viviane+sassen+photography" } },
  "pieter-hugo":            { name: "Pieter Hugo",             born: 1976, years: "1976–",     nationality: "South African",            country: "South Africa",        genre: "Portrait"    ,     style: "Documentary · Portrait",        bio: "Unsettling portraits from across Africa that challenge Western assumptions about the continent.", influences: ["diane-arbus", "richard-avedon"], links: { book: "https://www.amazon.com/s?k=pieter+hugo+photography" } },
  "fan-ho":                 { name: "Fan Ho",                  born: 1931, years: "1931–2016", nationality: "Hong Kong",            country: "Hong Kong",        genre: "Street"    ,         style: "Street · Fine Art",             bio: "Hong Kong's master of light and shadow. His 1950s street photographs transform the quotidian into cinema.", influences: ["brassai", "eugene-atget"], links: { book: "https://www.amazon.com/s?k=fan+ho+photography" } },
  "raghu-rai":              { name: "Raghu Rai",               born: 1942, years: "1942–",     nationality: "Indian",            country: "India",        genre: "Documentary"    ,            style: "Photojournalism · Documentary", bio: "India's most celebrated photojournalist. His images of the Bhopal gas tragedy remain the definitive record.", influences: ["henri-cartier-bresson", "sebastiao-salgado"], links: { book: "https://www.amazon.com/s?k=raghu+rai+photography" } },
  "nobuyoshi-araki-ii":     { name: "Masahisa Fukase",         born: 1934, years: "1934–2012", nationality: "Japanese",            country: "Japan",        genre: "Experimental"    ,          style: "Personal · Psychological",     bio: "Ravens — made during a period of breakdown after his divorce — is one of the most intense bodies of work in photography.", influences: ["daido-moriyama", "shomei-tomatsu"], links: { book: "https://www.amazon.com/s?k=masahisa+fukase+photography" } },
  "cristina-garcia-rodero":  { name: "Cristina García Rodero", born: 1949, years: "1949–",     nationality: "Spanish",            country: "Spain",        genre: "Documentary"    ,           style: "Documentary · Ritual",          bio: "First Spanish woman to join Magnum. Her Spain Hidden is a haunting record of religious and folk tradition.", influences: ["henri-cartier-bresson", "dorothea-lange"], links: { book: "https://www.amazon.com/s?k=cristina+garcia+rodero+photography" } },
  "anders-petersen":        { name: "Anders Petersen",         born: 1944, years: "1944–",     nationality: "Swedish",            country: "Sweden",        genre: "Street"    ,           style: "Street · Intimate",             bio: "Café Lehmitz is one of the most intimate photobooks ever made. Petersen photographed the marginalised with love.", influences: ["nan-goldin", "weegee"], links: { book: "https://www.amazon.com/s?k=anders+petersen+photography" } },
  "bruce-davidson":         { name: "Bruce Davidson",          born: 1933, years: "1933–",     nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Social",          bio: "East 100th Street and Brooklyn Gang are landmarks of engaged, humanistic documentary photography.", influences: ["walker-evans", "diane-arbus"], links: { website: "https://www.magnumphotos.com/photographer/bruce-davidson/", book: "https://www.amazon.com/s?k=bruce+davidson+photography" } },

  // ── ADDITIONAL 18 TO REACH 100 ───────────────────────────────────────────────
  "gordon-matta-clark":     { name: "Lewis Hine",              born: 1874, years: "1874–1940", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Social",          bio: "His photographs of child labour directly shaped US law. Photography as instrument of social reform.", influences: ["nadar"], links: { website: "https://www.moma.org/artists/2663", book: "https://www.amazon.com/s?k=lewis+hine+photography" } },
  "robert-doisneau":        { name: "Robert Doisneau",         born: 1912, years: "1912–1994", nationality: "French",            country: "France",        genre: "Street"    ,            style: "Humanist · Street",             bio: "The poet of Parisian everyday life. Le Baiser de l'Hôtel de Ville is the most reproduced photograph in history.", influences: ["brassai", "henri-cartier-bresson"], links: { website: "https://www.robert-doisneau.com", book: "https://www.amazon.com/s?k=robert+doisneau+photography" } },
  "josef-koudelka":         { name: "Josef Koudelka",          born: 1938, years: "1938–",     nationality: "Czech",            country: "Czech Republic",        genre: "Documentary"    ,             style: "Documentary · Gypsies",         bio: "His images of the Soviet invasion of Prague in 1968 were published anonymously. Gypsies is a masterwork of empathy.", influences: ["henri-cartier-bresson", "robert-frank"], links: { website: "https://www.magnumphotos.com/photographer/josef-koudelka/", book: "https://www.amazon.com/s?k=josef+koudelka+photography" } },
  "larry-clark":            { name: "Larry Clark",             born: 1943, years: "1943–",     nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Youth Culture",   bio: "Tulsa and Teenage Lust broke every taboo about how photographers could depict youth. Raw, dangerous, and essential.", influences: ["weegee", "nan-goldin"], links: { book: "https://www.amazon.com/s?k=larry+clark+photography" } },
  "bruce-gilden":           { name: "Bruce Gilden",            born: 1946, years: "1946–",     nationality: "American",            country: "USA",        genre: "Street"    ,          style: "Street · Confrontational",      bio: "Shoots strangers at point-blank range with a flash in New York. Aggressive, uncompromising, utterly distinctive.", influences: ["weegee", "lisette-model"], links: { website: "https://www.magnumphotos.com/photographer/bruce-gilden/", instagram: "https://www.instagram.com/bruce_gilden_magnum", book: "https://www.amazon.com/s?k=bruce+gilden+photography" } },
  "eve-arnold":             { name: "Eve Arnold",              born: 1912, years: "1912–2012", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Photojournalism · Portrait",    bio: "First woman to join Magnum Photos. Her portraits of Marilyn Monroe defined an era.", influences: ["dorothea-lange", "lisette-model"], links: { website: "https://www.magnumphotos.com/photographer/eve-arnold/", book: "https://www.amazon.com/s?k=eve+arnold+photography" } },
  "david-lachapelle":       { name: "David LaChapelle",        born: 1963, years: "1963–",     nationality: "American",            country: "USA",        genre: "Fashion"    ,          style: "Fashion · Hyperrealist",        bio: "Hyper-saturated, theatrical images that treat pop culture as both subject and critique.", influences: ["helmut-newton", "cindy-sherman"], links: { website: "https://www.lachapellestudio.com", instagram: "https://www.instagram.com/davidlachapelle", book: "https://www.amazon.com/s?k=david+lachapelle+photography" } },
  "edward-curtis":          { name: "Edward S. Curtis",        born: 1868, years: "1868–1952", nationality: "American",            country: "USA",        genre: "Documentary"    ,          style: "Documentary · Ethnographic",    bio: "Spent 30 years documenting Native American peoples in The North American Indian — a monumental and contested project.", influences: ["nadar"], links: { book: "https://www.amazon.com/s?k=edward+curtis+photography" } },
  "helmut-gernsheim":       { name: "Roger Fenton",            born: 1819, years: "1819–1869", nationality: "British",            country: "UK",        genre: "War"    ,           style: "War · Documentary",             bio: "The first war photographer. His Crimean War images brought conflict photography into existence.", influences: [], links: { website: "https://www.metmuseum.org/art/collection/search#!?q=roger+fenton", book: "https://www.amazon.com/s?k=roger+fenton+photography" } },
  "dorothea-lange-ii":      { name: "Germaine Krull",          born: 1897, years: "1897–1985", nationality: "German-French",            country: "Germany",        genre: "Fine Art"    ,     style: "Modernism · Industrial",        bio: "Her book Métal (1928) is a defining work of the New Vision movement. Bridges, machines, and movement abstracted.", influences: ["alfred-stieglitz", "man-ray"], links: { book: "https://www.amazon.com/s?k=germaine+krull+photography" } },
  "ragnar-axelsson":        { name: "Ragnar Axelsson",         born: 1952, years: "1952–",     nationality: "Icelandic",            country: "Iceland",        genre: "Documentary"    ,         style: "Documentary · Arctic",          bio: "Spent decades photographing the people and landscapes of the Arctic as climate change transforms them.", influences: ["sebastiao-salgado", "ansel-adams"], links: { book: "https://www.amazon.com/s?k=ragnar+axelsson+photography" } },
  "sebastien-lebbe":        { name: "Sebastião Barbosa",       born: 1961, years: "1961–",     nationality: "Brazilian",            country: "Brazil",        genre: "Documentary"    ,         style: "Documentary · Urban",           bio: "Documents the favelas and social contrasts of Brazil with unflinching directness.", influences: ["sebastiao-salgado", "weegee"], links: { book: "https://www.amazon.com/s?k=sebastiao+barbosa+photography" } },
  "ming-smith":             { name: "Ming Smith",              born: 1950, years: "1950–",     nationality: "American",            country: "USA",        genre: "Fine Art"    ,          style: "Fine Art · Jazz",               bio: "First Black woman photographer acquired by MoMA. Her dream-like images of Black life blend jazz and photography.", influences: ["gordon-parks", "diane-arbus"], links: { book: "https://www.amazon.com/s?k=ming+smith+photography" } },
  "daidojiro":              { name: "Ishiuchi Miyako",         born: 1947, years: "1947–",     nationality: "Japanese",            country: "Japan",        genre: "Fine Art"    ,          style: "Fine Art · Memory",             bio: "Photographs of her mother's belongings and Hiroshima survivors' garments — intimate archaeology of loss.", influences: ["rinko-kawauchi", "shomei-tomatsu"], links: { book: "https://www.amazon.com/s?k=ishiuchi+miyako+photography" } },
  "deana-lawson":           { name: "Deana Lawson",            born: 1979, years: "1979–",     nationality: "American",            country: "USA",        genre: "Portrait"    ,          style: "Portrait · Conceptual",         bio: "Staged portraits exploring Black intimacy, spirituality, and beauty with extraordinary formal precision.", influences: ["carrie-mae-weems", "richard-avedon"], links: { book: "https://www.amazon.com/s?k=deana+lawson+photography" } },
  "paul-graham":            { name: "Paul Graham",             born: 1956, years: "1956–",     nationality: "British",            country: "UK",        genre: "Documentary"    ,           style: "Documentary · Color",           bio: "The End of an Age and A Shimmer of Possibility are among the most thoughtful bodies of work in contemporary photography.", influences: ["william-eggleston", "stephen-shore"], links: { book: "https://www.amazon.com/s?k=paul+graham+photography" } },
  "dayanita-singh":         { name: "Dayanita Singh",          born: 1961, years: "1961–",     nationality: "Indian",            country: "India",        genre: "Documentary"    ,            style: "Documentary · Archive",         bio: "Reinvents the photobook as portable museum. Her books are objects that reframe how we encounter photography.", influences: ["raghu-rai", "henri-cartier-bresson"], links: { book: "https://www.amazon.com/s?k=dayanita+singh+photography" } },
  "tokihiro-sato":          { name: "Tokihiro Sato",           born: 1957, years: "1957–",     nationality: "Japanese",            country: "Japan",        genre: "Fine Art"    ,          style: "Fine Art · Light",              bio: "Creates long-exposure images of himself moving through landscapes, leaving trails of light as proof of presence.", influences: ["ansel-adams", "shomei-tomatsu"], links: { book: "https://www.amazon.com/s?k=tokihiro+sato+photography" } },
  "saul-leiter":            { name: "Saul Leiter",             born: 1923, years: "1923–2013", nationality: "American",            country: "USA",          genre: "Street",                style: "Color · Painterly",             bio: "Pioneer of colour photography whose intimate, painterly street images were largely unseen until rediscovered late in his life. Blurred windows, reflections and fragments of New York turned the city into abstract poetry.", influences: ["henri-cartier-bresson", "edward-steichen"], links: { website: "https://www.saulleiterfoundation.org", book: "https://www.amazon.com/s?k=saul+leiter+photography" } },

  // ── CLUSTER A — NON-WESTERN TRADITIONS ───────────────────────────────────────

  // Japanese
  "hiroshi-hamaya":         { name: "Hiroshi Hamaya",           born: 1915, years: "1915–1999", nationality: "Japanese",            country: "Japan",        genre: "Documentary",           style: "Documentary · Landscape",       bio: "Documented the transformation of rural Japan and anti-government protests with equal sensitivity. His Snow Land series is among the most lyrical bodies of work in Japanese photography.", influences: ["eugene-atget", "henri-cartier-bresson"], links: { book: "https://www.amazon.com/s?k=hiroshi+hamaya+photography" } },
  "ken-domon":              { name: "Ken Domon",                born: 1909, years: "1909–1990", nationality: "Japanese",            country: "Japan",        genre: "Documentary",           style: "Realist · Documentary",         bio: "Pioneer of Japanese realist photography. His unflinching images of atomic bomb survivors in Hiroshima and of children in poverty defined a socially committed photographic practice in postwar Japan.", influences: ["dorothea-lange", "w-eugene-smith"], links: { book: "https://www.amazon.com/s?k=ken+domon+photography" } },
  "yutaka-takanashi":       { name: "Yutaka Takanashi",         born: 1935, years: "1935–",     nationality: "Japanese",            country: "Japan",        genre: "Street",                style: "Urban · Atmospheric",           bio: "Co-founder of the Provoke magazine collective alongside Daido Moriyama and Takuma Nakahira. His Toshi-e (Towards the City) series captured Tokyo's post-war urban transformation with melancholy precision.", influences: ["daido-moriyama", "william-klein"], links: { book: "https://www.amazon.com/s?k=yutaka+takanashi+photography" } },
  "masahisa-fukase":        { name: "Masahisa Fukase",          born: 1934, years: "1934–2012", nationality: "Japanese",            country: "Japan",        genre: "Fine Art",              style: "Expressionist · Personal",      bio: "His Ravens series — obsessive photographs of crows taken after his divorce — is one of the most psychologically raw bodies of work in photography. Voted the world's best photobook 1986–2009.", influences: ["daido-moriyama", "shomei-tomatsu"], links: { book: "https://www.amazon.com/s?k=masahisa+fukase+ravens" } },

  // Indian
  "raghubir-singh":         { name: "Raghubir Singh",           born: 1942, years: "1942–1999", nationality: "Indian",              country: "India",        genre: "Documentary",           style: "Color · Street",               bio: "The master of Indian colour photography. Singh used the snapshot aesthetic to document the subcontinent's streets and people with vivid, democratic intimacy — insisting that colour was the natural language of India.", influences: ["henri-cartier-bresson", "william-eggleston"], links: { book: "https://www.amazon.com/s?k=raghubir+singh+photography" } },
  "ketaki-sheth":           { name: "Ketaki Sheth",             born: 1957, years: "1957–",     nationality: "Indian",              country: "India",        genre: "Documentary",           style: "Portrait · Documentary",        bio: "Known for her long-term projects on identity and community, including her seminal work on twins and the Sidis of India. Her photography combines anthropological depth with lyrical visual intelligence.", influences: ["dorothea-lange", "diane-arbus"], links: { book: "https://www.amazon.com/s?k=ketaki+sheth+photography" } },

  // Latin American
  "flor-garduno":           { name: "Flor Garduño",             born: 1957, years: "1957–",     nationality: "Mexican",             country: "Mexico",       genre: "Fine Art",              style: "Magical Realist · Portrait",    bio: "Studied under Manuel Álvarez Bravo and developed a visual language steeped in Mexican mythology and indigenous culture. Her photographs of women and ritual are among the most spiritually charged images in Latin American photography.", influences: ["manuel-alvarez-bravo", "tina-modotti"], links: { book: "https://www.amazon.com/s?k=flor+garduno+photography" } },
  "paz-errazuriz":          { name: "Paz Errázuriz",            born: 1944, years: "1944–",     nationality: "Chilean",             country: "Chile",        genre: "Documentary",           style: "Portrait · Social Documentary", bio: "Chile's most important documentary photographer. During the Pinochet dictatorship she photographed marginalised communities — boxers, sex workers, the mentally ill — with profound tenderness and moral courage.", influences: ["diane-arbus", "dorothea-lange"], links: { book: "https://www.amazon.com/s?k=paz+errazuriz+photography" } },

  // African
  "seydou-keita":           { name: "Seydou Keïta",             born: 1921, years: "1921–2001", nationality: "Malian",              country: "Mali",         genre: "Portrait",              style: "Studio Portrait",               bio: "Bamako's most celebrated portrait photographer. His studio portraits from the 1940s–60s defined an image of modern African identity on Africa's own terms — elegant, self-possessed, deeply humanist.", influences: ["nadar", "yousuf-karsh"], links: { book: "https://www.amazon.com/s?k=seydou+keita+photography" } },
  "malick-sidibe":          { name: "Malick Sidibé",            born: 1935, years: "1935–2016", nationality: "Malian",              country: "Mali",         genre: "Portrait",              style: "Studio Portrait · Social",      bio: "Photographer of Malian youth culture and independence-era joy. His images of dances, celebrations and young people in Bamako capture a society defining itself with exuberance. Winner of the Golden Lion at Venice, 2007.", influences: ["seydou-keita", "henri-cartier-bresson"], links: { book: "https://www.amazon.com/s?k=malick+sidibe+photography" } },
  "samuel-fosso":           { name: "Samuel Fosso",             born: 1962, years: "1962–",     nationality: "Cameroonian",         country: "Central African Republic", genre: "Fine Art",       style: "Self-Portrait · Conceptual",    bio: "Began photographing himself in his studio at night as a teenager; transformed self-portraiture into a conceptual practice exploring identity, colonialism and African history through elaborate costumed performances.", influences: ["malick-sidibe", "cindy-sherman"], links: { book: "https://www.amazon.com/s?k=samuel+fosso+photography" } },
  "santu-mofokeng":         { name: "Santu Mofokeng",           born: 1956, years: "1956–2020", nationality: "South African",       country: "South Africa", genre: "Documentary",           style: "Documentary · Personal",        bio: "One of the most significant photographers of apartheid and post-apartheid South Africa. His Chasing Shadows project documents sacred sites and the spiritual landscape of Black South African communities.", influences: ["gordon-parks", "w-eugene-smith"], links: { book: "https://www.amazon.com/s?k=santu+mofokeng+photography" } },

  // Middle Eastern
  "reza-deghati":           { name: "Reza Deghati",             born: 1952, years: "1952–",     nationality: "Iranian",             country: "France",       genre: "Documentary",           style: "Photojournalism · Humanitarian", bio: "Known simply as Reza, he has documented conflicts and humanitarian crises across more than 100 countries for National Geographic and Magnum. Born in Tabriz, his work bridges the Middle East and the wider world with deep empathy.", influences: ["henri-cartier-bresson", "sebastiao-salgado"], links: { website: "https://www.rezaphoto.org", book: "https://www.amazon.com/s?k=reza+deghati+photography" } },

  // ── CLUSTER B — DOCUMENTARY / PHOTOJOURNALISM ────────────────────────────────

  "larry-burrows":          { name: "Larry Burrows",             born: 1926, years: "1926–1971", nationality: "British",             country: "UK",           genre: "Documentary",           style: "War · Photojournalism",         bio: "Life magazine's most celebrated war photographer. His colour photographs from Vietnam — especially Reaching Out — set a new standard for combat photography. Killed in a helicopter crash over Laos in 1971.", influences: ["w-eugene-smith", "robert-capa"], links: { book: "https://www.amazon.com/s?k=larry+burrows+photography" } },
  "eddie-adams":            { name: "Eddie Adams",               born: 1933, years: "1933–2004", nationality: "American",            country: "USA",           genre: "Documentary",           style: "Photojournalism · Portrait",    bio: "Won the Pulitzer Prize in 1969 for his photograph of the execution of a Viet Cong prisoner — one of the most consequential images in photographic history. Spent decades grappling with its impact and the ethics of conflict photography.", influences: ["robert-capa", "w-eugene-smith"], links: { book: "https://www.amazon.com/s?k=eddie+adams+photographer" } },
  "david-turnley":          { name: "David Turnley",             born: 1955, years: "1955–",     nationality: "American",            country: "USA",           genre: "Documentary",           style: "Humanist · Photojournalism",    bio: "Pulitzer Prize-winning photojournalist who documented the fall of apartheid, the collapse of the Soviet Union, and conflicts across four decades. Known for his empathetic, intimate approach to photographing people in extremis.", influences: ["sebastiao-salgado", "w-eugene-smith"], links: { book: "https://www.amazon.com/s?k=david+turnley+photography" } },
  "susan-meiselas":         { name: "Susan Meiselas",            born: 1948, years: "1948–",     nationality: "American",            country: "USA",           genre: "Documentary",           style: "Political · Long-form",         bio: "Her photographs of the Nicaraguan revolution in 1978–79 are among the defining images of political conflict photography. A Magnum photographer known for long-term engagement with communities and for raising questions about representation and consent.", influences: ["dorothea-lange", "w-eugene-smith"], links: { website: "https://www.susanmeiselas.com", book: "https://www.amazon.com/s?k=susan+meiselas+photography" } },
  "gilles-peress":          { name: "Gilles Peress",             born: 1946, years: "1946–",     nationality: "French",              country: "France",        genre: "Documentary",           style: "Political · Conceptual",        bio: "Magnum photographer whose books on Ireland, Iran and Rwanda question what photographs can and cannot tell us. His work is as much an investigation of the medium's limits as it is documentary evidence.", influences: ["henri-cartier-bresson", "robert-frank"], links: { book: "https://www.amazon.com/s?k=gilles+peress+photography" } },

  // ── CLUSTER C — FINE ART / CONCEPTUAL ────────────────────────────────────────

  "bernd-hilla-becher":     { name: "Bernd & Hilla Becher",      born: 1931, years: "1931–2007 / 1934–2015", nationality: "German",   country: "Germany",      genre: "Fine Art",              style: "Typological · Conceptual",      bio: "Spent four decades systematically photographing industrial structures — water towers, blast furnaces, gas tanks — in strict frontal compositions. Their typological method became the foundation for the Düsseldorf School and influenced a generation of artists including Gursky, Ruff and Struth.", influences: ["eugene-atget", "walker-evans"], links: { book: "https://www.amazon.com/s?k=bernd+hilla+becher+photography" } },
  "thomas-ruff":            { name: "Thomas Ruff",               born: 1958, years: "1958–",     nationality: "German",              country: "Germany",       genre: "Fine Art",              style: "Conceptual · Large Format",     bio: "Studied under the Bechers at the Düsseldorf Academy and developed a practice that systematically questions what photographs represent. His large-scale passport-style portraits, press photographs, and internet-sourced nudes explore photography as information rather than expression.", influences: ["bernd-hilla-becher", "andreas-gursky"], links: { book: "https://www.amazon.com/s?k=thomas+ruff+photography" } },
  "francesca-woodman":      { name: "Francesca Woodman",         born: 1958, years: "1958–1981", nationality: "American",            country: "USA",           genre: "Fine Art",              style: "Surrealist · Self-Portrait",    bio: "Made almost all her photographs between the ages of 13 and 22 before her death at 22. Her blurred self-portraits in empty interiors — the body dissolving into wallpaper and architecture — are among the most haunting images in photography.", influences: ["man-ray", "cindy-sherman"], links: { book: "https://www.amazon.com/s?k=francesca+woodman+photography" } },
  "sophie-calle":           { name: "Sophie Calle",              born: 1953, years: "1953–",     nationality: "French",              country: "France",        genre: "Fine Art",              style: "Conceptual · Narrative",        bio: "Makes work that blurs photography, writing, and performance. She followed strangers, invented personas, and asked others to photograph her — turning surveillance, intimacy and loss into conceptual art that uses photography as both tool and subject.", influences: ["cindy-sherman", "nan-goldin"], links: { website: "https://www.sophiecalle.net", book: "https://www.amazon.com/s?k=sophie+calle+photography" } },

  // ── CLUSTER D — CONTEMPORARY ─────────────────────────────────────────────────

  "daniel-shea":            { name: "Daniel Shea",               born: 1986, years: "1986–",     nationality: "American",            country: "USA",           genre: "Documentary",           style: "Industrial · Long-form",        bio: "Documents the American industrial landscape and the communities shaped by it, from coal country to the Chicago stockyards. His long-term projects probe the relationship between labour, landscape, and economic decline.", influences: ["stephen-shore", "walker-evans"], links: { website: "https://www.danielshea.com", book: "https://www.amazon.com/s?k=daniel+shea+photography" } },
  "vanessa-winship":        { name: "Vanessa Winship",           born: 1960, years: "1960–",     nationality: "British",             country: "UK",            genre: "Documentary",           style: "Poetic · Portrait",             bio: "Winner of the Henri Cartier-Bresson Award. Her quiet, lyrical black-and-white portraits of communities in Eastern Europe, the Caucasus and America explore identity, belonging and the passage of time with unusual delicacy.", influences: ["henri-cartier-bresson", "diane-arbus"], links: { book: "https://www.amazon.com/s?k=vanessa+winship+photography" } },
  "daisuke-yokota":         { name: "Daisuke Yokota",            born: 1983, years: "1983–",     nationality: "Japanese",            country: "Japan",          genre: "Fine Art",              style: "Experimental · Abstract",       bio: "Makes photographs through extreme chemical and physical manipulation of film — bleaching, scratching, re-photographing — until the original image is barely recognisable. One of the most radical experimenters with photographic materiality in contemporary practice.", influences: ["daido-moriyama", "masahisa-fukase"], links: { book: "https://www.amazon.com/s?k=daisuke+yokota+photography" } },
};

const BORN_MIN = 1810;
const BORN_MAX = 1985;
const LINK_LABELS = { instagram: "Instagram", website: "Website", book: "Buy Book" };

const T = {
  bg: "#f5f2ec", paper: "#f9f7f2", ink: "#1a1812",
  inkMid: "#4a4538", inkLight: "#9a9080", inkFaint: "#c0b8a8",
  line: "#ccc4b0", border: "rgba(26,24,18,0.1)",
  blue: "#4a6fa5", red: "#8a4040", amber: "#a06020",
};
const SHOW_NAMES_AT  = 0.9;  // names appear earlier so key photographers are readable
const SHOW_YEARS_AT  = 2.2;
const OVERVIEW_SCALE = 0.38; // zoomed out enough to see most of the network
const DETAIL_SCALE   = 1.6;  // zoom level when a node is selected
const PAD = 0.04; // tighter padding so nodes use full width

// ─── DATA HOOK ────────────────────────────────────────────────────────────────
// Fetches photographers and connections from Supabase.
// Returns data in the same shape the rest of the app expects.
function usePhotographers() {
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        // Fetch photographers and connections in parallel
        const [{ data: photographers, error: pErr }, { data: connections, error: cErr }] =
          await Promise.all([
            supabase.from("photographers").select("*").order("born"),
            supabase.from("connections").select("*"),
          ]);

        if (pErr) throw pErr;
        if (cErr) throw cErr;
        if (cancelled) return;

        // Build the same shape as the old PHOTOGRAPHERS constant:
        // { [slug]: { name, born, nationality, country, bio, tags, genre, links, influences: [] } }
        const byId = {};
        photographers.forEach(p => {
          byId[p.id] = {
            ...p,
            // genre = first tag, for filter and node colour
            genre: (p.tags && p.tags.length > 0) ? p.tags[0] : "Documentary",
            influences: [],
          };
        });

        connections.forEach(c => {
          if (byId[c.from_id]) {
            byId[c.from_id].influences.push(c.to_id);
          }
        });

        setData(byId);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    // Subscribe to realtime changes so graph updates immediately when admin adds data
    const sub = supabase
      .channel("db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "photographers" }, fetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, fetch)
      .subscribe();

    return () => { cancelled = true; sub.unsubscribe(); };
  }, []);

  return { data, loading, error };
}

// ─── AUTH HOOK ────────────────────────────────────────────────────────────────
// Single source of truth for the current user.
// Persists to localStorage so session survives page refresh.
//
// TO CONNECT SUPABASE: replace the body of this hook with Supabase auth calls.
// The shape of `user` must stay the same — everything else just works.
//
const STORAGE_KEY = "lineage_user_v1";
const DISCLAIMER_KEY = "lineage_disclaimer_v1";
const FEEDBACK_URL   = "https://forms.gle/KkufuFe3oHxAvGVx6";

// ─── DISCLAIMER PAGE ──────────────────────────────────────────────────────────
// ─── ROADMAP PAGE ─────────────────────────────────────────────────────────────
function RoadmapPage({ onBack, PHOTOGRAPHERS, totalConnections }) {
  const sections = [
    {
      label: "NOW",
      heading: "What you're using today",
      body: "Lineage is a live, growing network. Every photographer and connection is added manually by the editor with a verified source. You can explore the network anonymously, trace influence paths between photographers, and create a profile to map your own place in photographic history.",
    },
    {
      label: "NEXT",
      heading: "Making it persistent",
      body: "Right now everything you enter lives only in your browser. We're building proper accounts so your profile, influences and discoveries are saved and accessible across devices. This is the single most important thing we're working on.",
    },
    {
      label: "SOON",
      heading: "A credible, growing network",
      body: "We want every connection in the network to have a formal citation. We're working through the sources systematically — you can follow progress on the Sources page, and submit citations yourself. We're also expanding the network with deliberate attention to non-Western traditions and contemporary photographers.",
    },
    {
      label: "LATER",
      heading: "A community layer",
      body: "Verified photographer profiles. The ability to suggest new connections or dispute existing ones with evidence. A tier system that distinguishes between community members, verified photographers, and canonical figures in the archive.",
    },
    {
      label: "FURTHER OUT",
      heading: "The network effect",
      body: "Lineage becomes more valuable as more photographers join. As the community grows, connections between living photographers become possible — not just historical influence, but contemporary lineage. Who are today's photographers shaping the next generation? A large enough network starts to answer that.\n\nThe longer-term vision is a mobile app — photography is a mobile practice, and discovery should happen wherever you are. Your lineage, your influences, and the broader network in your pocket.",
    },
  ];

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <header style={{ padding: "13px 22px 11px", borderBottom: `1px solid ${T.border}`, background: T.paper, flexShrink: 0, display: "flex", alignItems: "center" }}>
        <button onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMid, fontSize: 13, fontFamily: "'EB Garamond', serif", padding: 0, marginRight: 18 }}>
          ← Back
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>What's coming</div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          <p style={{ fontSize: 14, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7, marginBottom: 40 }}>
            Lineage is an early prototype. Here's where we're taking it.
          </p>

          {sections.map((section, i) => (
            <div key={i} style={{ display: "flex", gap: 24, marginBottom: 36, paddingBottom: 32, borderBottom: i < sections.length - 1 ? `1px solid ${T.border}` : "none" }}>
              {/* Label column */}
              <div style={{ width: 80, flexShrink: 0, paddingTop: 3 }}>
                <div style={{ fontSize: 7.5, letterSpacing: "0.14em", color: T.inkFaint }}>{section.label}</div>
              </div>
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontWeight: 600, color: T.ink, marginBottom: 10, lineHeight: 1.3 }}>
                  {section.heading}
                </div>
                {section.body.split("\n\n").map((para, j) => (
                  <p key={j} style={{ fontSize: 14.5, color: T.inkMid, lineHeight: 1.85, margin: j > 0 ? "12px 0 0" : 0 }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <p style={{ fontSize: 13, color: T.inkFaint, fontStyle: "italic", lineHeight: 1.7, marginTop: 8 }}>
            We're building this carefully. If something's missing or wrong,{" "}
            <a href="mailto:lineage.prjct@gmail.com?subject=Feedback"
              style={{ color: T.inkFaint, textDecoration: "none", borderBottom: `1px solid ${T.border}` }}>
              let us know →
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}

// ─── PRIVACY PAGE ─────────────────────────────────────────────────────────────
function PrivacyPage({ onBack }) {
  const updated = "April 2026";
  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <header style={{ padding: "13px 22px 11px", borderBottom: `1px solid ${T.border}`, background: T.paper, flexShrink: 0, display: "flex", alignItems: "center" }}>
        <button onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMid, fontSize: 13, fontFamily: "'EB Garamond', serif", padding: 0, marginRight: 18 }}>
          ← Back
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>Privacy Policy</div>
        <div style={{ marginLeft: 10, fontSize: 9, letterSpacing: "0.08em", color: T.inkFaint }}>Last updated: {updated}</div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          {[
            {
              heading: "What Lineage is",
              body: "Lineage is a prototype web application for exploring documented influence relationships between photographers. It is currently in an early development phase.",
            },
            {
              heading: "Data we collect",
              body: null,
              subsections: [
                {
                  label: "In the application",
                  text: "Lineage currently stores no data on any server. Any information you enter — your name, influences, gear, notes — is stored exclusively in your browser's local storage and never transmitted to us or any third party. This data persists until you clear your browser data or it is removed by your browser.",
                },
                {
                  label: "Feedback form",
                  text: "If you choose to submit feedback via our Google Form, that data is collected and stored by Google under their own privacy policy. We receive your responses and use them solely to improve the product. We do not share this data with third parties.",
                },
                {
                  label: "No tracking",
                  text: "We do not use cookies, analytics tools, advertising trackers, or any other form of behavioural tracking.",
                },
              ],
            },
            {
              heading: "Future development",
              body: "We intend to introduce optional user accounts in a future version of Lineage. When we do, this policy will be updated to reflect what data is collected, how it is stored, and your rights under applicable law. We will not introduce data collection without updating this policy first.",
            },
            {
              heading: "Contact",
              body: null,
              contact: true,
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: 36, paddingBottom: 32, borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontSize: 8.5, letterSpacing: "0.14em", color: T.inkLight, marginBottom: 14 }}>
                {section.heading.toUpperCase()}
              </div>
              {section.body && (
                <p style={{ fontSize: 14.5, color: T.inkMid, lineHeight: 1.85, margin: 0 }}>{section.body}</p>
              )}
              {section.subsections && section.subsections.map((sub, j) => (
                <div key={j} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontStyle: "italic", color: T.inkLight, marginBottom: 6 }}>{sub.label}</div>
                  <p style={{ fontSize: 14.5, color: T.inkMid, lineHeight: 1.85, margin: 0 }}>{sub.text}</p>
                </div>
              ))}
              {section.contact && (
                <p style={{ fontSize: 14.5, color: T.inkMid, lineHeight: 1.85, margin: 0 }}>
                  Questions about this policy:{" "}
                  <a href="mailto:lineage.prjct@gmail.com"
                    style={{ color: T.ink, textDecoration: "none", borderBottom: `1px solid ${T.border}` }}>
                    lineage.prjct@gmail.com
                  </a>
                </p>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

function DisclaimerPage({ onEnter, feedbackUrl, returning, onPrivacy, onRoadmap }) {
  return (
    <div style={{
      width: "100%", height: "100dvh", background: T.bg,
      fontFamily: "'EB Garamond', Georgia, serif",
      display: "flex", flexDirection: "column",
      overflowY: "auto", color: T.ink,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", padding: "10vh 28px 60px", display: "flex", flexDirection: "column" }}>

        {/* Wordmark */}
        {returning && (
          <button onClick={onEnter}
            style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", color: T.inkMid, fontSize: 13, fontFamily: "'EB Garamond', serif", padding: "0 0 32px", letterSpacing: "0.02em" }}>
            ← Back
          </button>
        )}
        <div style={{ fontSize: 58, fontFamily: "'Libre Baskerville', serif", fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1, marginBottom: 16 }}>
          Lineage
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 18, fontStyle: "italic", color: T.inkMid, lineHeight: 1.65, marginBottom: 48, maxWidth: 420 }}>
          A map of photographic influence — and your place in it.
        </p>

        {/* Divider */}
        <div style={{ width: 32, height: 1, background: T.border, marginBottom: 48 }} />

        {/* What is it */}
        <div style={{ fontSize: 8.5, letterSpacing: "0.14em", color: T.inkLight, marginBottom: 12 }}>WHAT IS LINEAGE</div>
        <p style={{ fontSize: 15.5, color: T.inkMid, lineHeight: 1.85, marginBottom: 40 }}>
          Lineage maps documented connections between photographers — who influenced whom, across generations and traditions. The network currently covers 114 photographers, with sources cited where available. You can explore it anonymously, or add yourself and mark the photographers who shaped your own practice.
        </p>

        {/* Who is it for */}
        <div style={{ fontSize: 8.5, letterSpacing: "0.14em", color: T.inkLight, marginBottom: 12 }}>WHO IS IT FOR</div>
        <p style={{ fontSize: 15.5, color: T.inkMid, lineHeight: 1.85, marginBottom: 40 }}>
          Photographers, students, educators, and anyone curious about how photographic ideas travel. If you've ever traced a visual lineage — from a photographer back to their influences, and further back still — this is built for that.
        </p>

        {/* What you can do */}
        <div style={{ fontSize: 8.5, letterSpacing: "0.14em", color: T.inkLight, marginBottom: 12 }}>WHAT YOU CAN DO</div>
        <p style={{ fontSize: 15.5, color: T.inkMid, lineHeight: 1.85, marginBottom: 48 }}>
          Browse the network and follow threads of influence. Open any photographer to see their connections, biography, and links. If you create a profile, you can mark photographers as influences, document your gear, and see where your own lineage sits within the broader history of the medium.
        </p>

        {/* Divider */}
        <div style={{ width: 32, height: 1, background: T.border, marginBottom: 40 }} />

        {/* Prototype note */}
        <div style={{ fontSize: 8.5, letterSpacing: "0.14em", color: T.inkLight, marginBottom: 12 }}>A NOTE BEFORE YOU BEGIN</div>
        <p style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.85, marginBottom: 12 }}>
          Lineage is an early prototype. Everything you enter lives only in your browser — nothing is sent to any server. Your data persists in your browser's local storage until you clear it, and is never shared or collected by us.
        </p>
        <p style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.85, marginBottom: 40 }}>
          There is no sign-up, so no personal data is collected. The only data we gather is optional feedback via a short survey.
        </p>

        {/* Italic invite */}
        <p style={{ fontSize: 16, fontStyle: "italic", color: T.inkLight, lineHeight: 1.7, marginBottom: 36 }}>
          Explore freely. Add yourself. Tell us what you think.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={onEnter}
            style={{
              fontSize: 11, letterSpacing: "0.16em", padding: "13px 40px",
              background: T.ink, border: "none", borderRadius: 2,
              cursor: "pointer", color: T.bg,
              fontFamily: "'EB Garamond', serif",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {returning ? "← BACK TO LINEAGE" : "ENTER LINEAGE"}
          </button>
          {feedbackUrl && (
            <a href={feedbackUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, letterSpacing: "0.1em", color: T.bg, textDecoration: "none", background: T.amber, padding: "13px 20px", borderRadius: 2, whiteSpace: "nowrap" }}>
              SHARE FEEDBACK
            </a>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, borderTop: `1px solid ${T.border}`, paddingTop: 20, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: T.inkFaint, letterSpacing: "0.06em" }}>
            Early prototype · {new Date().getFullYear()} · <a href="mailto:lineage.prjct@gmail.com" style={{ color: T.inkFaint, textDecoration: "none", borderBottom: `1px solid ${T.border}` }}>lineage.prjct@gmail.com</a>
          </span>
          <a href="#roadmap" onClick={e => { e.preventDefault(); onRoadmap?.(); }}
            style={{ fontSize: 10, color: T.inkFaint, letterSpacing: "0.06em", textDecoration: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
            What's coming
          </a>
          <a href="#privacy" onClick={e => { e.preventDefault(); onPrivacy?.(); }}
            style={{ fontSize: 10, color: T.inkFaint, letterSpacing: "0.06em", textDecoration: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
            Privacy Policy
          </a>
        </div>

      </div>
    </div>
  );
}

function useCurrentUser() {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser) => {
    if (!authUser) { setProfile(null); return; }
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    setProfile(data || null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user || null);
      await fetchProfile(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      fetchProfile(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data.user;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateUser = async (updates) => {
    if (!user) return;

    // Fields that live on the users table directly
    const directFields = ['name', 'email', 'is_admin', 'access_level'];
    const direct = {};
    const profileUpdates = {};

    Object.entries(updates).forEach(([k, v]) => {
      if (directFields.includes(k)) direct[k] = v;
      else profileUpdates[k] = v;
    });

    // Merge profile updates into the jsonb profile column
    const payload = {};
    if (Object.keys(direct).length) Object.assign(payload, direct);
    if (Object.keys(profileUpdates).length) {
      const currentProfile = profile?.profile || {};
      payload.profile = { ...currentProfile, ...profileUpdates };
    }

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  // merged: null if not authenticated, partial if profile still loading, full when both ready
  const merged = user ? {
    id: user.id,
    email: user.email,
    name: (profile?.name) || user.user_metadata?.name || user.email,
    is_admin: profile?.is_admin || false,
    access_level: profile?.access_level || "view",
    ...(profile?.profile || {}),
    ...(profile || {}),
  } : null;

  return { user: merged, signup, login, logout, updateUser, loading };
}

// ─── CONNECTION COUNT ─────────────────────────────────────────────────────────
function buildConnCounts(data) {
  const c = {};
  Object.keys(data).forEach(id => { c[id] = 0; });
  Object.entries(data).forEach(([id, p]) => {
    p.influences.forEach(inf => { c[id] = (c[id] || 0) + 1; c[inf] = (c[inf] || 0) + 1; });
  });
  return c;
}

// ─── GENRE METADATA — centroids arranged in a ring ───────────────────────────
const GENRE_META = {
  "Street":       { color: "#3d5a72" },
  "Documentary":  { color: "#5a6e3a" },
  "Portrait":     { color: "#7a4f3a" },
  "Fine Art":     { color: "#4a4a72" },
  "War":          { color: "#6e3a3a" },
  "Fashion":      { color: "#5a4a6e" },
  "Conceptual":   { color: "#3a6068" },
  "Experimental": { color: "#6e5a3a" },
  "Landscape":    { color: "#3a6048" },
};

// ─── GENRE-GRAVITY FORCE LAYOUT ──────────────────────────────────────────────
// Standard force layout (repulsion + edge attraction + centre gravity)
// plus a gentle pull toward each genre's centroid arranged in a ring.
// GENRE_STRENGTH = 0.42, RING_RATIO = 0.40 (40% of canvas).
// Highly-connected cross-genre nodes resist the pull — they stay where
// their connections demand, creating visible bridges between clusters.
function computeForceLayout(dims, data) {
  const ids = Object.keys(data);
  if (ids.length === 0) return {};

  const W = dims.w * 3.0;
  const H = dims.h;
  const cx = W / 2, cy = H / 2;
  const N = ids.length;

  // Build adjacency — bidirectional
  const adj = {};
  ids.forEach(id => { adj[id] = new Set(); });
  ids.forEach(id => {
    (data[id].influences || []).forEach(inf => {
      if (adj[id]) adj[id].add(inf);
      if (adj[inf]) adj[inf].add(id);
    });
  });

  const connC = {};
  ids.forEach(id => { connC[id] = adj[id].size; });
  const maxConn = Math.max(...Object.values(connC), 1);

  // ── SEED: jittered grid ───────────────────────────────────────────────────
  // Guarantees initial separation regardless of genre or network size.
  // Grid cell size scales so all nodes fit comfortably in the canvas.
  const cols = Math.ceil(Math.sqrt(N * (W / H)));
  const rows = Math.ceil(N / cols);
  const cellW = W * 0.8 / Math.max(cols, 1);
  const cellH = H * 0.8 / Math.max(rows, 1);
  const startX = cx - (cols * cellW) / 2;
  const startY = cy - (rows * cellH) / 2;

  // Sort by connection count descending so hubs go first (centre of grid)
  const sorted = [...ids].sort((a, b) => connC[b] - connC[a]);

  const pos = {};
  sorted.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Deterministic jitter per node
    const seed = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const jx = ((seed * 7919) % 1000) / 1000 * cellW * 0.4 - cellW * 0.2;
    const jy = ((seed * 6271) % 1000) / 1000 * cellH * 0.4 - cellH * 0.2;
    pos[id] = {
      x: startX + col * cellW + cellW / 2 + jx,
      y: startY + row * cellH + cellH / 2 + jy,
      vx: 0, vy: 0, fx: 0, fy: 0,
    };
  });

  // ── SIMULATION ────────────────────────────────────────────────────────────
  // Node spacing scales with N so the graph doesn't compress at scale
  const spacing  = Math.max(80, Math.min(cellW, cellH) * 0.85);
  const REPULSION    = spacing;
  const EDGE_ATTRACT = 0.018;
  const GRAVITY      = N < 15 ? 0.004 : 0.022;
  const BOUNDARY_PAD = spacing * 0.5;
  const DAMPING      = 0.80;
  const ITERATIONS   = 280;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const alpha = 1 - iter / ITERATIONS;

    ids.forEach(id => { pos[id].fx = 0; pos[id].fy = 0; });

    // Repulsion: every pair
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos[ids[i]], b = pos[ids[j]];
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < REPULSION * 2) {
          const f = (REPULSION / dist) * (REPULSION / dist) * alpha * 0.5;
          a.fx -= dx / dist * f;  a.fy -= dy / dist * f;
          b.fx += dx / dist * f;  b.fy += dy / dist * f;
        }
      }
    }

    // Edge attraction — only between connected nodes
    ids.forEach(id => {
      adj[id].forEach(nbId => {
        if (!pos[nbId]) return;
        const dx = pos[nbId].x - pos[id].x;
        const dy = pos[nbId].y - pos[id].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        // Attract only when further than spacing
        if (dist > spacing) {
          pos[id].fx += dx * EDGE_ATTRACT * alpha;
          pos[id].fy += dy * EDGE_ATTRACT * alpha;
        }
      });
    });

    // Gentle centre gravity — weaker for hubs
    ids.forEach(id => {
      const gravScale = Math.max(0.1, 1 - connC[id] / maxConn * 0.8);
      pos[id].fx += (cx - pos[id].x) * GRAVITY * gravScale * alpha;
      pos[id].fy += (cy - pos[id].y) * GRAVITY * gravScale * alpha;
    });

    // Boundary repulsion
    ids.forEach(id => {
      const { x, y } = pos[id];
      const bp = BOUNDARY_PAD;
      if (x < bp)         pos[id].fx += (bp - x) * 0.8;
      if (x > W - bp)     pos[id].fx -= (x - (W - bp)) * 0.8;
      if (y < bp)         pos[id].fy += (bp - y) * 0.8;
      if (y > H - bp)     pos[id].fy -= (y - (H - bp)) * 0.8;
    });

    // Integrate
    ids.forEach(id => {
      const n = pos[id];
      n.vx = (n.vx + n.fx) * DAMPING;
      n.vy = (n.vy + n.fy) * DAMPING;
      n.x = Math.max(BOUNDARY_PAD, Math.min(W - BOUNDARY_PAD, n.x + n.vx));
      n.y = Math.max(BOUNDARY_PAD, Math.min(H - BOUNDARY_PAD, n.y + n.vy));
    });
  }

  // ── POST-PASS: hard minimum separation ───────────────────────────────────
  // Run until all nodes are at least `spacing * 0.7` apart
  const MIN_SEP = spacing * 0.7;
  for (let pass = 0; pass < 40; pass++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos[ids[i]], b = pos[ids[j]];
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < MIN_SEP) {
          const push = (MIN_SEP - dist) / 2 / dist;
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  return pos;
}
// ─── BFS ──────────────────────────────────────────────────────────────────────
function findPath(fromId, toId, localEdits = {}, data = PHOTOGRAPHERS, userProfile = null) {
  if (fromId === toId) return [fromId];
  const adj = {};
  Object.keys(data).forEach(id => { adj[id] = new Set(); });
  if (userProfile) adj["__user__"] = new Set();
  Object.entries(data).forEach(([id, p]) => {
    const influences = localEdits[id]?.influences ?? p.influences;
    influences.forEach(inf => { adj[id].add(inf); adj[inf].add(id); });
  });
  // Add user edges
  if (userProfile) {
    (userProfile.influences || []).forEach(inf => {
      adj["__user__"].add(inf);
      if (adj[inf]) adj[inf].add("__user__");
    });
  }
  const visited = new Set([fromId]);
  const queue = [[fromId]];
  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    for (const nb of adj[node]) {
      if (nb === toId) return [...path, nb];
      if (!visited.has(nb)) { visited.add(nb); queue.push([...path, nb]); }
    }
  }
  return null;
}


// ─── LIGHTHOUSE COMPONENTS ────────────────────────────────────────────────────

function LighthouseLightbox({ works, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const work = works[idx];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, works.length - 1));
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [works, onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(10,9,8,0.95)", zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Close */}
      <button onClick={onClose}
        style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", color: "rgba(249,247,242,0.6)", fontSize: 24, cursor: "pointer", lineHeight: 1, zIndex: 10 }}>×</button>

      {/* Counter */}
      {works.length > 1 && (
        <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", fontSize: 10, letterSpacing: "0.12em", color: "rgba(249,247,242,0.4)" }}>
          {idx + 1} / {works.length}
        </div>
      )}

      {/* Image */}
      <div onClick={e => e.stopPropagation()}
        style={{ maxWidth: "min(90vw, 900px)", maxHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={work.url}
          alt={work.caption || ""}
          style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      </div>

      {/* Caption */}
      {work.caption && (
        <p style={{ marginTop: 16, fontSize: 12, color: "rgba(249,247,242,0.55)", fontStyle: "italic", fontFamily: "'EB Garamond', Georgia, serif", textAlign: "center", maxWidth: 500, lineHeight: 1.6, padding: "0 24px" }}>
          {work.caption}
        </p>
      )}

      {/* Prev / Next arrows */}
      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i - 1); }}
          style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(249,247,242,0.5)", fontSize: 28, cursor: "pointer", lineHeight: 1, padding: "8px 12px" }}>‹</button>
      )}
      {idx < works.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i + 1); }}
          style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(249,247,242,0.5)", fontSize: 28, cursor: "pointer", lineHeight: 1, padding: "8px 12px" }}>›</button>
      )}

      {/* Thumbnail strip if multiple */}
      {works.length > 1 && (
        <div onClick={e => e.stopPropagation()}
          style={{ position: "absolute", bottom: 20, display: "flex", gap: 8 }}>
          {works.map((w, i) => (
            <div key={i} onClick={() => setIdx(i)}
              style={{ width: 36, height: 36, borderRadius: 2, overflow: "hidden", cursor: "pointer", opacity: i === idx ? 1 : 0.45, border: i === idx ? "1.5px solid rgba(249,247,242,0.6)" : "1.5px solid transparent", transition: "opacity 0.15s, border 0.15s" }}>
              <img src={w.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LighthouseStrip({ works, onOpen }) {
  if (!works || works.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
      {works.map((work, i) => (
        <div key={i} onClick={() => onOpen(i)}
          style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 2, overflow: "hidden", cursor: "pointer", background: "rgba(26,24,18,0.06)", position: "relative" }}>
          <img
            src={work.url} alt={work.caption || ""}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.15s" }}
            onError={e => { e.target.style.display = "none"; }}
            onMouseEnter={e => e.target.style.opacity = "0.8"}
            onMouseLeave={e => e.target.style.opacity = "1"}
          />
        </div>
      ))}
    </div>
  );
}

// ─── GEAR PAGE ────────────────────────────────────────────────────────────────
// ─── SOURCES PAGE ─────────────────────────────────────────────────────────────
// Public page listing all connections with citations where available.
// Sources marked "pending" are well-established in photography history
// but not yet formally cited — contributions welcome.


function SourcesPage({ onBack, PHOTOGRAPHERS, filterName }) {
  const [search, setSearch] = useState(filterName || "");
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("connections").select("*, from:from_id(name), to:to_id(name)").then(({ data }) => {
      if (data) setConnections(data);
      setLoading(false);
    });
  }, []);

  const filtered = connections
    .filter(c => !search.trim() ||
      c.from?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.to?.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.from?.name || "").localeCompare(b.from?.name || ""));

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <header style={{ padding: "13px 22px 11px", borderBottom: `1px solid ${T.border}`, background: T.paper, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMid, fontSize: 13, fontFamily: "'EB Garamond', serif", padding: 0, marginRight: 18 }}>
              ← Back
            </button>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>
              {filterName ? `Sources — ${filterName}` : "Sources"}
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.1em", color: T.inkLight, marginTop: 3 }}>
              {filtered.length} connection{filtered.length !== 1 ? "s" : ""} · all citations verified
            </div>
          </div>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by photographer…"
          style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "5px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }}
        />
      </header>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", padding: "8px 22px", borderBottom: `1px solid ${T.border}`, background: T.paper, position: "sticky", top: 0, zIndex: 10 }}>
          {["PHOTOGRAPHER", "INFLUENCED BY", "SOURCE"].map(h => (
            <div key={h} style={{ fontSize: 7.5, letterSpacing: "0.12em", color: T.inkLight }}>{h}</div>
          ))}
        </div>

        {loading && (
          <div style={{ padding: "40px 22px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: T.inkFaint, fontStyle: "italic" }}>Loading…</p>
          </div>
        )}

        {!loading && filtered.map((c, i) => (
          <div key={c.id}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", padding: "10px 22px", borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? "transparent" : "rgba(26,24,18,0.015)" }}>
            <div style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", paddingRight: 12 }}>{c.from?.name}</div>
            <div style={{ fontSize: 13, color: T.blue, paddingRight: 12 }}>{c.to?.name}</div>
            <div style={{ fontSize: 11.5, color: T.inkMid, lineHeight: 1.5 }}>
              {c.source_text}
              {c.source_url && (
                <a href={c.source_url} target="_blank" rel="noopener noreferrer"
                  style={{ marginLeft: 6, fontSize: 10, color: T.amber, textDecoration: "none", borderBottom: `1px solid rgba(160,96,32,0.3)` }}>
                  ↗ view
                </a>
              )}
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: "40px 22px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: T.inkFaint, fontStyle: "italic" }}>
              {search ? `No connections matching "${search}"` : "No connections yet."}
            </p>
          </div>
        )}

        <div style={{ padding: "20px 22px", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic", lineHeight: 1.6 }}>
            Every connection in Lineage is verified and cited. If you spot an error, contact <a href="mailto:lineage.prjct@gmail.com" style={{ color: T.inkFaint, borderBottom: `1px solid ${T.border}` }}>lineage.prjct@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div style={{ width: "100%", height: "100dvh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'EB Garamond', serif", padding: 32 }}>
        <div style={{ maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", color: T.ink, marginBottom: 12 }}>Something went wrong</div>
          <p style={{ fontSize: 13, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, marginBottom: 20 }}>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button onClick={() => this.setState({ error: null })}
            style={{ padding: "8px 20px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontSize: 11, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif" }}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, onExplore, onAbout, onRoadmap, onLogout, updateUser, PHOTOGRAPHERS }) {
  const [editing, setEditing]         = useState(false);
  const [draft, setDraft]             = useState({ influences: [], lighthouseWorks: [], ...user });
  const [infSearch, setInfSearch]     = useState("");
  const [profileLightbox, setProfileLightbox] = useState(null);
  const [showMenu, setShowMenu]       = useState(false);

  // Re-sync draft when user updates
  useEffect(() => {
    setDraft({ influences: [], lighthouseWorks: [], ...user });
  }, [user?.id]);

  const saveEdit = () => { updateUser(draft); setEditing(false); };

  const Section = ({ title, onEdit, children, empty, emptyText }) => (
    <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.13em", color: T.inkLight }}>{title}</div>
        {onEdit && (
          <button onClick={onEdit}
            style={{ marginLeft: "auto", fontSize: 8.5, letterSpacing: "0.08em", padding: "3px 8px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkLight, fontFamily: "'EB Garamond', serif" }}>
            {empty ? "+ ADD" : "EDIT"}
          </button>
        )}
      </div>
      {empty
        ? <p style={{ fontSize: 13, color: T.inkFaint, fontStyle: "italic" }}>{emptyText}</p>
        : children}
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {profileLightbox !== null && user.lighthouseWorks?.length > 0 && (
        <LighthouseLightbox works={user.lighthouseWorks} startIndex={profileLightbox} onClose={() => setProfileLightbox(null)} />
      )}

      {/* Header */}
      <header style={{ padding: "13px 16px 11px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", background: T.paper, flexShrink: 0, gap: 10 }}>
        <div onClick={() => setAppView("graph")} style={{ fontSize: 19, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", flexShrink: 0, cursor: "pointer" }}>Lineage</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onExplore}
            style={{ fontSize: 10, letterSpacing: "0.1em", padding: "5px 12px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif", whiteSpace: "nowrap" }}>
            EXPLORE →
          </button>
          {showMenu && <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(m => !m)}
              style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", padding: "5px 8px", display: "flex", flexDirection: "column", gap: 3.5, alignItems: "center", justifyContent: "center", width: 32, height: 28 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 14, height: 1.2, background: T.inkMid, borderRadius: 1 }} />)}
            </button>
            {showMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: T.paper, border: `1px solid ${T.border}`, borderRadius: 2, boxShadow: "0 4px 16px rgba(26,24,18,0.1)", zIndex: 200, minWidth: 160, overflow: "hidden" }}>
                {[
                  { label: "Share feedback", href: FEEDBACK_URL, external: true },
                  { label: "About", onClick: () => { setShowMenu(false); onAbout(); } },
                  { label: "Roadmap", onClick: () => { setShowMenu(false); onRoadmap(); } },
                  { label: "Sign out", onClick: () => { setShowMenu(false); onLogout(); }, divider: true },
                ].map((item, i) => (
                  <div key={i}>
                    {item.divider && <div style={{ height: 1, background: T.border }} />}
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)}
                        style={{ display: "block", padding: "10px 16px", fontSize: 13, fontFamily: "'EB Garamond', serif", color: T.inkMid, textDecoration: "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {item.label}
                      </a>
                    ) : (
                      <button onClick={item.onClick}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontFamily: "'EB Garamond', serif", color: item.label === "Sign out" ? T.inkLight : T.inkMid, background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "28px 22px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>

          {/* Profile header */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.amber, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, fontFamily: "'Libre Baskerville', serif", color: T.bg, fontWeight: 600 }}>
                {((user.name || user.email || "?") + "").split(" ").map(w => w[0] || "").join("").slice(0, 2) || "?"}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1.15, marginBottom: 4 }}>
                {user.name || user.email}
              </div>
              <div style={{ fontSize: 11, color: T.inkLight, letterSpacing: "0.04em" }}>
                {[user.genre, user.country, user.born].filter(Boolean).join(" · ")}
              </div>
              {user.bio && <p style={{ fontSize: 14, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, margin: "8px 0 0" }}>{user.bio}</p>}
            </div>
            <button onClick={() => { setDraft({ ...user }); setEditing(true); }}
              style={{ fontSize: 9, letterSpacing: "0.1em", padding: "4px 10px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif", flexShrink: 0 }}>
              EDIT
            </button>
          </div>

          {/* Influences */}
          <Section title="MY INFLUENCES" onEdit={() => { setDraft({ ...user }); setEditing(true); }}
            empty={!user.influences?.length} emptyText="Which photographers shaped your vision?">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(user.influences || []).map(id => (
                <div key={id} style={{ fontSize: 13, color: T.blue, padding: "4px 10px", border: `1px solid rgba(74,111,165,0.25)`, borderRadius: 2 }}>
                  {PHOTOGRAPHERS[id]?.name || id}
                </div>
              ))}
            </div>
          </Section>

          {/* Lighthouse works */}
          <Section title="LIGHTHOUSE WORKS" onEdit={() => { setDraft({ ...user }); setEditing(true); }}
            empty={!user.lighthouseWorks?.length} emptyText="Add 3–5 images that best represent your work.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {(user.lighthouseWorks || []).map((work, i) => (
                <div key={work.id || i} onClick={() => setProfileLightbox(i)} style={{ cursor: "pointer" }}>
                  <div style={{ paddingTop: "75%", position: "relative", background: "rgba(26,24,18,0.04)", overflow: "hidden", borderRadius: 2 }}>
                    <img src={work.url} alt={work.caption || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  </div>
                  {work.caption && <p style={{ fontSize: 11, color: T.inkLight, marginTop: 5, fontStyle: "italic" }}>{work.caption}</p>}
                </div>
              ))}
            </div>
          </Section>

          {/* Links */}
          <Section title="LINKS" onEdit={() => { setDraft({ ...user }); setEditing(true); }}
            empty={!user.website && !user.instagram && !user.twitter} emptyText="Add your website, Instagram, or other links.">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[{ key: "website", label: "Website" }, { key: "instagram", label: "Instagram" }, { key: "twitter", label: "Twitter / X" }]
                .filter(({ key }) => user[key])
                .map(({ key, label }) => (
                  <a key={key} href={user[key].startsWith("http") ? user[key] : `https://${user[key]}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12.5, color: T.inkMid, padding: "4px 10px", border: `1px solid ${T.border}`, borderRadius: 2, textDecoration: "none" }}>
                    {label} ↗
                  </a>
                ))}
            </div>
          </Section>

          {/* Explore CTA */}
          <div style={{ padding: "24px", border: `1px solid ${T.border}`, borderRadius: 2, background: T.paper, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 14px" }}>
              Explore the network and discover photographic lineages.
            </p>
            <button onClick={onExplore}
              style={{ fontSize: 10.5, letterSpacing: "0.12em", padding: "9px 24px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
              EXPLORE THE NETWORK →
            </button>
          </div>

        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: "absolute", inset: 0, background: T.paper, zIndex: 90, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>Edit Profile</div>
            <button onClick={() => setEditing(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.inkLight, padding: 0 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
            <div style={{ maxWidth: 500, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "NAME", key: "name" },
                { label: "BIRTH YEAR", key: "born" },
                { label: "COUNTRY", key: "country" },
                { label: "WEBSITE", key: "website" },
                { label: "INSTAGRAM", key: "instagram" },
                { label: "TWITTER / X", key: "twitter" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
                  <input value={draft[key] || ""} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                    style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 6 }}>GENRE</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {["Street","Documentary","Portrait","Landscape","Fashion","Fine Art","War","Conceptual","Experimental"].map(g => (
                    <button key={g} onClick={() => setDraft(d => ({ ...d, genre: g }))}
                      style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${draft.genre === g ? T.ink : T.border}`, borderRadius: 2, background: draft.genre === g ? T.ink : "transparent", color: draft.genre === g ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif" }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>BIO</div>
                <textarea value={draft.bio || ""} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} rows={3}
                  style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.ink, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
              </div>
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 8 }}>MY INFLUENCES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {(draft.influences || []).map(id => (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 10px", border: `1px solid rgba(74,111,165,0.3)`, borderRadius: 2 }}>
                      <span style={{ fontSize: 12, color: T.blue }}>{PHOTOGRAPHERS[id]?.name || id}</span>
                      <button onClick={() => setDraft(d => ({ ...d, influences: (d.influences || []).filter(i => i !== id) }))}
                        style={{ background: "none", border: "none", color: "rgba(74,111,165,0.5)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{ position: "relative" }}>
                  <input value={infSearch} onChange={e => setInfSearch(e.target.value)} placeholder="Search photographers…"
                    style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
                  {infSearch.trim().length > 0 && (() => {
                    const cur = new Set(draft.influences || []);
                    const matches = Object.entries(PHOTOGRAPHERS).filter(([id, p]) => !cur.has(id) && p.name.toLowerCase().includes(infSearch.toLowerCase())).slice(0, 6);
                    return matches.length > 0 ? (
                      <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: T.paper, border: `1px solid ${T.border}`, boxShadow: "0 4px 16px rgba(26,24,18,0.08)", zIndex: 10 }}>
                        {matches.map(([id, p], i) => (
                          <div key={id} onClick={() => { setDraft(d => ({ ...d, influences: [...(d.influences || []), id] })); setInfSearch(""); }}
                            style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < matches.length-1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 8, alignItems: "baseline" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(74,111,165,0.05)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{p.name}</span>
                            <span style={{ fontSize: 9, color: T.inkLight }}>{p.born}</span>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Lighthouse works */}
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 8 }}>LIGHTHOUSE WORKS <span style={{ color: T.inkFaint, textTransform: "none", letterSpacing: 0, fontSize: 10 }}>— up to 5 images</span></div>
                {(draft.lighthouseWorks || []).map((work, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, padding: "8px 10px", background: "rgba(26,24,18,0.03)", borderRadius: 2 }}>
                    {work.url && <img src={work.url} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 1, flexShrink: 0 }} onError={e => e.target.style.display="none"} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input value={work.url || ""} onChange={e => setDraft(d => { const w = [...(d.lighthouseWorks||[])]; w[i] = {...w[i], url: e.target.value}; return {...d, lighthouseWorks: w}; })}
                        placeholder="Image URL…"
                        style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "4px 0", fontSize: 12, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box", marginBottom: 4 }} />
                      <input value={work.caption || ""} onChange={e => setDraft(d => { const w = [...(d.lighthouseWorks||[])]; w[i] = {...w[i], caption: e.target.value}; return {...d, lighthouseWorks: w}; })}
                        placeholder="Caption (optional)…"
                        style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "4px 0", fontSize: 11, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.inkMid, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <button onClick={() => setDraft(d => ({ ...d, lighthouseWorks: (d.lighthouseWorks||[]).filter((_,j) => j !== i) }))}
                      style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 18, padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>×</button>
                  </div>
                ))}
                {(draft.lighthouseWorks?.length || 0) < 5 && (
                  <button onClick={() => setDraft(d => ({ ...d, lighthouseWorks: [...(d.lighthouseWorks||[]), { url: "", caption: "", id: Date.now().toString() }] }))}
                    style={{ fontSize: 11, padding: "5px 12px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif" }}>
                    + ADD IMAGE
                  </button>
                )}
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setEditing(false)}
              style={{ padding: "7px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontSize: 10.5, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
              CANCEL
            </button>
            <button onClick={saveEdit}
              style={{ padding: "7px 20px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif" }}>
              SAVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const { signup, login } = useCurrentUser();
  const [mode, setMode]   = useState("login");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", password: "" });

  const handleLogin = async () => {
    setError(null); setLoading(true);
    try {
      const user = await login(draft.email, draft.password);
      onAuth(user);
    } catch (err) {
      setError(err.message || "Sign in failed. Check your email and password.");
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!draft.name || !draft.email || !draft.password) { setError("Please fill in all fields."); return; }
    setError(null); setLoading(true);
    try {
      const user = await signup(draft.email, draft.password, draft.name);
      onAuth(user);
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'EB Garamond', Georgia, serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 380, padding: "0 28px" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", color: T.ink, marginBottom: 6 }}>Lineage</div>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: T.inkLight }}>Map your photographic influence</div>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); }}
              style={{ flex: 1, padding: "8px", background: "none", border: "none", borderBottom: `2px solid ${mode === m ? T.ink : "transparent"}`, cursor: "pointer", fontSize: 10, letterSpacing: "0.1em", color: mode === m ? T.ink : T.inkLight, fontFamily: "'EB Garamond', serif", marginBottom: -1 }}>
              {m === "login" ? "SIGN IN" : "JOIN"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "signup" && (
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>FULL NAME</div>
              <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "7px 0", fontSize: 15, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
            </div>
          )}
          {[{ label: "EMAIL", key: "email", type: "email" }, { label: "PASSWORD", key: "password", type: "password" }].map(({ label, key, type }) => (
            <div key={key}>
              <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
              <input type={type} value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())}
                style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "7px 0", fontSize: 15, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}

          {mode === "signup" && (
            <p style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>
              Your data is stored securely. No data is shared with third parties.
            </p>
          )}

          {error && <div style={{ fontSize: 12, color: T.red, fontStyle: "italic" }}>{error}</div>}

          <button onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}
            style={{ padding: "10px", background: T.ink, border: "none", borderRadius: 2, cursor: loading ? "default" : "pointer", color: T.bg, fontSize: 11, letterSpacing: "0.12em", fontFamily: "'EB Garamond', serif", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? "…" : mode === "login" ? "SIGN IN" : "JOIN LINEAGE"}
          </button>

          <div style={{ textAlign: "center" }}>
            <span onClick={() => onAuth(null)} style={{ fontSize: 11, color: T.inkFaint, cursor: "pointer", letterSpacing: "0.06em" }}>
              EXPLORE WITHOUT ACCOUNT →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: ADD PHOTOGRAPHER ──────────────────────────────────────────────────
const PHOTOGRAPHER_TAGS = ["Street", "Documentary", "Portrait", "Landscape", "Fashion", "Fine Art", "War", "Conceptual", "Experimental"];

function AddPhotographerModal({ onClose, onSaved }) {
  const [draft, setDraft] = useState({ name: "", born: "", nationality: "", country: "", bio: "", tags: [], links: {} });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const toggleTag = (tag) => setDraft(d => ({
    ...d, tags: d.tags.includes(tag) ? d.tags.filter(t => t !== tag) : [...d.tags, tag],
  }));

  const save = async () => {
    if (!draft.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from("photographers")
        .insert({
          name:        draft.name.trim(),
          born:        draft.born ? parseInt(draft.born) : null,
          nationality: draft.nationality.trim() || null,
          country:     draft.country.trim() || null,
          bio:         draft.bio.trim() || null,
          tags:        draft.tags,
          links:       draft.links,
        })
        .select()
        .single();
      if (err) throw err;
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,24,18,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 580, background: T.paper, borderRadius: "4px 4px 0 0", maxHeight: "min(90dvh, 600px)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>Add Photographer</div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.inkLight, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "NAME *", key: "name", placeholder: "e.g. Henri Cartier-Bresson" },
            { label: "BORN", key: "born", placeholder: "e.g. 1908" },
            { label: "COUNTRY", key: "country", placeholder: "e.g. France" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
              <input value={draft[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}

          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 8 }}>GENRE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {PHOTOGRAPHER_TAGS.map(tag => {
                const selected = (draft.tags || []).includes(tag);
                return (
                  <button key={tag} type="button"
                    onClick={() => setDraft(d => ({
                      ...d,
                      tags: selected
                        ? (d.tags || []).filter(t => t !== tag)
                        : [...(d.tags || []), tag]
                    }))}
                    style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${selected ? T.ink : T.border}`, borderRadius: 2, background: selected ? T.ink : "transparent", color: selected ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif" }}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>BIO</div>
            <textarea value={draft.bio} onChange={e => set("bio", e.target.value)} rows={3} placeholder="A short biography…"
              style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
          </div>

          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>WEBSITE <span style={{ color: T.inkFaint }}>(optional)</span></div>
            <input value={draft.links.website || ""} onChange={e => setDraft(d => ({ ...d, links: { ...d.links, website: e.target.value } }))} placeholder="https://…"
              style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
          </div>

          {error && <div style={{ fontSize: 12, color: T.red, fontStyle: "italic" }}>{error}</div>}
        </div>
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
          <button onClick={onClose}
            style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontSize: 10.5, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
            CANCEL
          </button>
          <button onClick={save} disabled={saving}
            style={{ flex: 1, padding: "8px", background: T.ink, border: "none", borderRadius: 2, cursor: saving ? "default" : "pointer", color: T.bg, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "SAVING…" : "ADD PHOTOGRAPHER"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: ADD CONNECTION ────────────────────────────────────────────────────
function AddConnectionModal({ photographers, onClose, onSaved }) {
  const [fromId, setFromId]     = useState("");
  const [toId, setToId]         = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl]   = useState("");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const pList = Object.values(photographers).sort((a, b) => a.name.localeCompare(b.name));

  const fromPhotographer = photographers[fromId];
  const toPhotographer   = photographers[toId];

  const save = async () => {
    if (!fromId || !toId)      { setError("Please select both photographers."); return; }
    if (fromId === toId)       { setError("A photographer cannot influence themselves."); return; }
    if (!sourceText.trim())    { setError("A source is required for every connection."); return; }
    setSaving(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from("connections")
        .insert({
          from_id:     fromId,
          to_id:       toId,
          source_text: sourceText.trim(),
          source_url:  sourceUrl.trim() || null,
          status:      "confirmed",
        })
        .select()
        .single();
      if (err) throw err;
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err.message.includes("unique") ? "This connection already exists." : err.message);
    } finally {
      setSaving(false);
    }
  };

  const SearchField = ({ label, value, search, setSearch, setId, excludeId }) => {
    const matches = pList
      .filter(p => p.id !== excludeId && p.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 6);
    return (
      <div>
        <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", flex: 1 }}>{value.name}</span>
            <button onClick={() => { setId(""); setSearch(""); }}
              style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search photographers…" autoFocus
              style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
            {search && matches.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, background: T.paper, border: `1px solid ${T.border}`, boxShadow: "0 4px 16px rgba(26,24,18,0.1)", zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
                {matches.map((p, i) => (
                  <div key={p.id} onClick={() => { setId(p.id); setSearch(""); }}
                    style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < matches.length - 1 ? `1px solid ${T.border}` : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize: 13.5, fontFamily: "'Libre Baskerville', serif" }}>{p.name}</span>
                    {p.born && <span style={{ fontSize: 9, color: T.inkLight, marginLeft: 8 }}>{p.born}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,24,18,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 580, background: T.paper, borderRadius: "4px 4px 0 0", maxHeight: "min(90dvh, 600px)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>Add Connection</div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.inkLight, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Direction indicator */}
          {fromPhotographer && toPhotographer && (
            <div style={{ padding: "10px 14px", background: "rgba(74,111,165,0.06)", border: `1px solid rgba(74,111,165,0.15)`, borderRadius: 2, fontSize: 13, color: T.inkMid, fontStyle: "italic", lineHeight: 1.5 }}>
              <strong style={{ fontStyle: "normal", color: T.ink }}>{fromPhotographer.name}</strong> was influenced by <strong style={{ fontStyle: "normal", color: T.ink }}>{toPhotographer.name}</strong>
            </div>
          )}

          <SearchField label="PHOTOGRAPHER (influenced)" value={fromPhotographer} search={fromSearch} setSearch={setFromSearch} setId={setFromId} excludeId={toId} />
          <SearchField label="INFLUENCED BY" value={toPhotographer} search={toSearch} setSearch={setToSearch} setId={setToId} excludeId={fromId} />

          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>SOURCE <span style={{ color: T.red }}>*</span></div>
            <input value={sourceText} onChange={e => setSourceText(e.target.value)} placeholder="e.g. HCB, The Mind's Eye, 1999 — p.14"
              style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>SOURCE URL <span style={{ color: T.inkFaint }}>(optional)</span></div>
            <input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://…"
              style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
          </div>

          {error && <div style={{ fontSize: 12, color: T.red, fontStyle: "italic" }}>{error}</div>}
        </div>
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
          <button onClick={onClose}
            style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontSize: 10.5, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
            CANCEL
          </button>
          <button onClick={save} disabled={saving}
            style={{ flex: 1, padding: "8px", background: T.ink, border: "none", borderRadius: 2, cursor: saving ? "default" : "pointer", color: T.bg, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "SAVING…" : "ADD CONNECTION"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Lineage() {
  // ── DATA ──
  const { data: PHOTOGRAPHERS, loading: dataLoading } = usePhotographers();
  const { user, signup, login, logout, updateUser, loading: authLoading } = useCurrentUser();

  // ── APP ROUTING STATE ──
  const [appView, setAppView] = useState(() => {
    // Show disclaimer on first ever visit
    const seenDisclaimer = localStorage.getItem(DISCLAIMER_KEY);
    if (!seenDisclaimer) return "disclaimer";
    return "graph"; // auth check happens async — useEffect below handles routing
  });
  const [sourcesFilter, setSourcesFilter] = useState(null);
  const [prevAppView, setPrevAppView]     = useState(null);
  const [footerMenuOpen, setFooterMenuOpen]   = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen]   = useState(false);
  const [lightbox, setLightbox]               = useState(null);
  const [showAddPhotographer, setShowAddPhotographer] = useState(false);
  const [showAddConnection, setShowAddConnection]     = useState(false);
  const [newlySavedPhotographer, setNewlySavedPhotographer] = useState(null); // prompt to add connection after save

  // ── PERSONAL GRAPH STATE ──
  const [nodeStates, setNodeStates] = useState(() => {
    try {
      const saved = user ? localStorage.getItem(`lineage_nodes_${user.id}`) : null;
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // ── USER PROFILE STATE ──
  const freshUserRef = useRef(null); // kept for compatibility
  const activeUser = user;
  const isAdmin = activeUser?.is_admin || false;

  const navigateTo = (view) => { setPrevAppView(appView); setAppView(view); };

  const initialRouteDone = useRef(false);

  // Once auth check completes, route appropriately — only fires once ever
  useEffect(() => {
    if (authLoading) return;
    if (initialRouteDone.current) return;
    initialRouteDone.current = true;
    const seenDisclaimer = localStorage.getItem(DISCLAIMER_KEY);
    if (!seenDisclaimer) return;
    if (user && appView === "graph") {
      setAppView("profile");
    }
  }, [authLoading]);
  const userProfile = activeUser || null;
  const setUserProfile = (p) => updateUser(p);
  const [showAddSelf, setShowAddSelf]   = useState(false);
  const [addSelfStep, setAddSelfStep]   = useState(1);
  const [selfDraft, setSelfDraft]       = useState({ name: "", born: "", country: "", genre: "Street", bio: "", influences: [] });
  const [selfInfSearch, setSelfInfSearch] = useState("");
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`lineage_nodes_${user.id}`, JSON.stringify(nodeStates));
  }, [nodeStates, user]);

  // ── STATE ──
  const [onboarding, setOnboarding]     = useState(true);
  const [onboardFading, setOnboardFading] = useState(false);
  const [mode, setMode]                 = useState("explore");
  const [editMode, setEditMode]         = useState(false);
  const [editDraft, setEditDraft]       = useState(null);
  const [infSearch, setInfSearch]       = useState("");
  const [localEdits, setLocalEdits]     = useState({});
  // Filters
  const [filterCountry, setFilterCountry] = useState(null);
  const [filterGenre, setFilterGenre]     = useState(null);
  const [filterOpen, setFilterOpen]       = useState(false);
  // Disputed connections — maps "id1--id2" → flag count
  // Seed a few real historically debated influences for demo
  const [selected, setSelected]         = useState(null);
  const [pulsingNode, setPulsingNode]   = useState(null);
  const [hovered, setHovered]           = useState(null);
  const [ripples, setRipples]           = useState([]);
  const rippleKeyRef                    = useRef(0);
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [pathFrom, setPathFrom]         = useState(null);
  const [pathTo, setPathTo]             = useState(null);
  const [pathResult, setPathResult]     = useState(null);
  const [pathStep, setPathStep]         = useState(0);
  // Path-mode search overlay
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchTarget, setSearchTarget] = useState(null);
  // Explore-mode search
  const [pathSearchQuery, setPathSearchQuery] = useState("");
  const [exploreSearch, setExploreSearch] = useState(false);
  const [exploreQuery, setExploreQuery]   = useState("");
  const exploreInputRef = useRef(null);
  const [scale, setScale]               = useState(OVERVIEW_SCALE);
  const [pan, setPan]                   = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning]       = useState(false);
  const [panStart, setPanStart]         = useState(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isMobile, setIsMobile]         = useState(false);
  const containerRef   = useRef(null);
  const touchRef       = useRef(null);
  const lastTouchDist  = useRef(null);
  const animFrameRef   = useRef(null);
  const momentumRef    = useRef(null);
  const lastTouchTime  = useRef(null);
  const lastTouchPos   = useRef(null);
  const lastTapRef     = useRef(null); // { time, x, y } for double tap detection

  const dismissOnboarding = useCallback(() => {
    if (!onboarding) return;
    setOnboardFading(true);
    setTimeout(() => setOnboarding(false), 600);
  }, [onboarding]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 680);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const obs = new ResizeObserver(([e]) =>
      setDims({ w: e.contentRect.width, h: e.contentRect.height }));
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);


  useEffect(() => {
    if (!pathResult) return;
    setPathStep(0);
    let i = 0;
    const iv = setInterval(() => {
      i++; setPathStep(i);
      if (i >= pathResult.length - 1) clearInterval(iv);
    }, 380);
    return () => clearInterval(iv);
  }, [pathResult]);

  useEffect(() => {
    if (pathFrom && pathTo) setPathResult(findPath(pathFrom, pathTo, localEdits, PHOTOGRAPHERS, userProfile));
    else setPathResult(null);
  }, [pathFrom, pathTo, localEdits, userProfile]);

  const positions  = useMemo(() => computeForceLayout(dims, PHOTOGRAPHERS), [dims, PHOTOGRAPHERS]);
  const connCounts = useMemo(() => buildConnCounts(PHOTOGRAPHERS), [PHOTOGRAPHERS]);

  const centredRef = useRef(false);
  const maxConn    = useMemo(() => Object.values(connCounts).length ? Math.max(...Object.values(connCounts)) : 1, [connCounts]);

  // Zoom-spread positions: as scale increases, nodes move away from the
  // centroid of the graph — so zooming in genuinely spreads the constellation
  const scaledPos = useMemo(() => {
    const ids = Object.keys(positions);
    if (ids.length === 0) return positions;

    const cx = ids.reduce((s, id) => s + positions[id].x, 0) / ids.length;
    const cy = ids.reduce((s, id) => s + positions[id].y, 0) / ids.length;
    const spread = 0.28 + Math.sqrt(scale) * 0.55;

    const result = {};
    ids.forEach(id => {
      result[id] = {
        x: cx + (positions[id].x - cx) * spread,
        y: cy + (positions[id].y - cy) * spread,
      };
    });

    // Place user node near graph centroid with slight downward offset
    // Then nudge away from any overlapping photographer nodes
    if (userProfile) {
      let ux = cx;
      let uy = cy + (dims.h * 0.18) * spread;

      // Push away from nearby nodes
      const MIN_DIST = 28;
      for (let pass = 0; pass < 10; pass++) {
        let nudgeX = 0, nudgeY = 0;
        Object.values(result).forEach(pos => {
          const dx = ux - pos.x;
          const dy = uy - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_DIST && dist > 0) {
            const force = (MIN_DIST - dist) / dist;
            nudgeX += dx * force;
            nudgeY += dy * force;
          }
        });
        if (Math.abs(nudgeX) < 0.1 && Math.abs(nudgeY) < 0.1) break;
        ux += nudgeX * 0.5;
        uy += nudgeY * 0.5;
      }

      result["__user__"] = { x: ux, y: uy };
    }
    return result;
  }, [positions, scale, userProfile, dims]);

  // Centre the graph on first load and whenever photographers change
  useEffect(() => {
    if (!dims.w || !dims.h) return;
    const ids = Object.keys(scaledPos);
    if (ids.length === 0) {
      // Empty network — centre the canvas
      setPan({ x: dims.w / 2, y: dims.h / 2 });
      return;
    }
    const cx = ids.reduce((s, id) => s + scaledPos[id].x, 0) / ids.length;
    const cy = ids.reduce((s, id) => s + scaledPos[id].y, 0) / ids.length;
    setPan({ x: dims.w / 2 - cx, y: dims.h / 2 - cy });
    centredRef.current = true;
  }, [dims, PHOTOGRAPHERS]); // re-centre when photographer list changes

  // When a node is selected — zoom to overview and centre the whole network
  // The sheet pushes the graph up, so we offset pan upward slightly to keep network visible
  const panToNode = useCallback((id) => {
    // Compute centroid of all nodes at overview scale
    const ids = Object.keys(scaledPos);
    if (ids.length === 0) return;

    const targetScale = SHEET_SCALE;
    // Spread at overview scale
    const spread = 0.28 + Math.sqrt(targetScale) * 0.55;
    // Centroid in position space
    const posIds = Object.keys(positions);
    const pcx = posIds.reduce((s, pid) => s + positions[pid].x, 0) / posIds.length;
    const pcy = posIds.reduce((s, pid) => s + positions[pid].y, 0) / posIds.length;

    // Centroid after spread applied
    const cx = pcx; // spread doesn't move centroid
    const cy = pcy;

    // Sheet height at overview — push graph up by half the sheet height
    const sheetH = isMobile ? dims.h * 0.52 : 280;
    const availH = dims.h - sheetH;

    // Pan to centre network in available space
    const targetPanX = dims.w / 2 - cx;
    const targetPanY = availH / 2 - cy;

    const startPan   = { x: pan.x, y: pan.y };
    const startScale = scale;
    const duration   = 500;
    const start      = performance.now();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      setScale(startScale + (targetScale - startScale) * e);
      setPan({
        x: startPan.x + (targetPanX - startPan.x) * e,
        y: startPan.y + (targetPanY - startPan.y) * e,
      });
      if (t < 1) animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [scaledPos, positions, pan, scale, dims, isMobile]);

  // Animate back to overview
  // Sheet-open scale — zoomed out further than normal overview
  const SHEET_SCALE = 0.22;

  const zoomOut = useCallback(() => {
    // Animate back to overview scale, centred on the graph centroid
    const posIds = Object.keys(positions);
    const cx = posIds.length ? posIds.reduce((s, id) => s + positions[id].x, 0) / posIds.length : dims.w / 2;
    const cy = posIds.length ? posIds.reduce((s, id) => s + positions[id].y, 0) / posIds.length : dims.h / 2;
    const targetPanX = dims.w / 2 - cx;
    const targetPanY = dims.h / 2 - cy;
    const startPan   = { x: pan.x, y: pan.y };
    const startScale = scale;
    const duration   = 480;
    const start      = performance.now();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      setScale(startScale + (OVERVIEW_SCALE - startScale) * e);
      setPan({
        x: startPan.x + (targetPanX - startPan.x) * e,
        y: startPan.y + (targetPanY - startPan.y) * e,
      });
      if (t < 1) animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [pan, scale, positions, dims]);

  const switchMode = (m, opts = {}) => {
    setMode(m);
    if (!opts.keepSheet) { setSelected(null); setSheetOpen(false); }
    setEditMode(false);
    if (!opts.keepPath) { setPathFrom(null); setPathTo(null); setPathResult(null); }
    setSearchTarget(null);
    setExploreSearch(false); setExploreQuery("");
    if (!opts.keepSheet) zoomOut();
  };

  const handleNodeTap = (id) => {
    dismissOnboarding();
    if (mode === "path") {
      if (!pathFrom || searchTarget === "from") { setPathFrom(id); setSearchTarget(null); }
      else if (!pathTo || searchTarget === "to") { if (id !== pathFrom) { setPathTo(id); setSearchTarget(null); } }
      else { setPathFrom(id); setPathTo(null); setPathResult(null); }
      return;
    }
    if (selected === id) { setSelected(null); setSheetOpen(false); setEditMode(false); zoomOut(); }
    else {
      setSelected(id);
      setSheetOpen(true);
      setEditMode(false);
      panToNode(id);
      // Trigger pulse animation
      setPulsingNode(null);
      requestAnimationFrame(() => setPulsingNode(id));
      setTimeout(() => setPulsingNode(null), 600);
    }
  };

  const onMouseDown = (e) => {
    if (e.target.closest?.(".node")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = useCallback((e) => {
    if (isPanning && panStart) setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);
  const onMouseUp = () => { setIsPanning(false); setPanStart(null); };
  const onWheel   = (e) => { e.preventDefault(); dismissOnboarding(); setScale(s => Math.min(4.5, Math.max(0.15, s - e.deltaY * 0.0015))); };

  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    dismissOnboarding();

    // Cancel any momentum animation
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    momentumRef.current = null;
    lastTouchPos.current = null;

    // Double tap to zoom in
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      const last = lastTapRef.current;
      if (last && now - last.time < 300 &&
          Math.abs(touch.clientX - last.x) < 30 &&
          Math.abs(touch.clientY - last.y) < 30) {
        lastTapRef.current = null;
        // Zoom in 2× centered on tap point
        const container = containerRef.current;
        const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
        const tapX = touch.clientX - rect.left;
        const tapY = touch.clientY - rect.top;
        setScale(s => {
          const newScale = Math.min(s * 2, 4.5);
          const ratio = newScale / s;
          setPan(p => ({
            x: tapX - (tapX - p.x) * ratio,
            y: tapY - (tapY - p.y) * ratio,
          }));
          return newScale;
        });
        return;
      }
      lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
    }

    if (e.touches.length === 1) {
      // Record finger start for pan and for tap detection
      touchRef.current = {
        mode: "pan",
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        panOriginX: pan.x,
        panOriginY: pan.y,
        moved: false,
        startTime: Date.now(),
      };
      lastTouchDist.current = null;
    } else if (e.touches.length === 2) {
      const t0 = e.touches[0], t1 = e.touches[1];
      const dx = t1.clientX - t0.clientX;
      const dy = t1.clientY - t0.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      lastTouchDist.current = dist;
      touchRef.current = {
        mode: "pinch",
        startDist: dist,
        startScale: scale,
        startPanX: pan.x,
        startPanY: pan.y,
        // midpoint in screen coords
        midX: (t0.clientX + t1.clientX) / 2,
        midY: (t0.clientY + t1.clientY) / 2,
      };
    }
  }, [pan, scale, dismissOnboarding]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!touchRef.current) return;

    if (e.touches.length === 1 && touchRef.current.mode === "pan") {
      const touch = e.touches[0];
      const dx = touch.clientX - touchRef.current.startX;
      const dy = touch.clientY - touchRef.current.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) touchRef.current.moved = true;
      if (touchRef.current.moved) {
        // Track velocity — delta since last move event
        const now = Date.now();
        if (lastTouchPos.current) {
          const dt = Math.max(1, now - lastTouchTime.current);
          momentumRef.current = {
            vx: (touch.clientX - lastTouchPos.current.x) / dt,
            vy: (touch.clientY - lastTouchPos.current.y) / dt,
          };
        }
        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
        lastTouchTime.current = now;

        setPan({
          x: touchRef.current.panOriginX + dx,
          y: touchRef.current.panOriginY + dy,
        });
      }
    } else if (e.touches.length === 2 && touchRef.current.mode === "pinch") {
      const t0 = e.touches[0], t1 = e.touches[1];
      const dx = t1.clientX - t0.clientX;
      const dy = t1.clientY - t0.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const { startDist, startScale, startPanX, startPanY, midX, midY } = touchRef.current;
      const newScale = Math.min(4.5, Math.max(0.15, startScale * (dist / startDist)));
      const currentMidX = (t0.clientX + t1.clientX) / 2;
      const currentMidY = (t0.clientY + t1.clientY) / 2;
      setPan({
        x: startPanX + (currentMidX - midX),
        y: startPanY + (currentMidY - midY),
      });
      setScale(newScale);
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();

    // Detect tap — single finger, not moved, within 250ms, and never went into pinch mode
    if (
      e.changedTouches.length === 1 &&
      touchRef.current?.mode === "pan" &&
      !touchRef.current.moved &&
      !touchRef.current.wasPinch &&
      Date.now() - touchRef.current.startTime < 250
    ) {
      const touch = e.changedTouches[0];

      // Convert touch to graph space accounting for container offset + pan
      const TAP_RADIUS = 48;
      const container = containerRef.current;
      const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
      const localX = touch.clientX - rect.left;
      const localY = touch.clientY - rect.top;
      const graphX = localX - pan.x;
      const graphY = localY - pan.y;

      let nearestId = null;
      let nearestDist = TAP_RADIUS;
      Object.entries(scaledPos).forEach(([id, pos]) => {
        const dx = graphX - pos.x;
        const dy = graphY - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) { nearestDist = dist; nearestId = id; }
      });

      if (nearestId) {
        handleNodeTap(nearestId);
      } else {
        setSelected(null);
        setSheetOpen(false);
        setEditMode(false);
      }

      // Clear momentum on tap
      momentumRef.current = null;
      lastTouchPos.current = null;

    } else if (touchRef.current?.moved && e.touches.length === 0) {
      // Launch momentum animation — decay velocity over ~400ms
      const vel = momentumRef.current;
      if (vel && (Math.abs(vel.vx) > 0.1 || Math.abs(vel.vy) > 0.1)) {
        const DECAY = 0.92; // per frame decay factor
        let vx = vel.vx * 16; // scale to px/frame at 60fps
        let vy = vel.vy * 16;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        const step = () => {
          vx *= DECAY;
          vy *= DECAY;
          if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3) return;
          setPan(p => ({ x: p.x + vx, y: p.y + vy }));
          animFrameRef.current = requestAnimationFrame(step);
        };
        animFrameRef.current = requestAnimationFrame(step);
      }
    }

    // Reset velocity tracking
    momentumRef.current = null;
    lastTouchPos.current = null;
    lastTouchTime.current = null;

    if (e.touches.length === 1) {
      touchRef.current = {
        mode: "pan",
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        panOriginX: pan.x,
        panOriginY: pan.y,
        moved: false,
        wasPinch: true,
        startTime: Date.now(),
      };
      lastTouchDist.current = null;
    } else if (e.touches.length === 0) {
      touchRef.current = null;
      lastTouchDist.current = null;
    }
  }, [pan, scaledPos, handleNodeTap]);

  // Register touch events with passive:false so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart",  onTouchStart, { passive: false });
    el.addEventListener("touchmove",   onTouchMove,  { passive: false });
    el.addEventListener("touchend",    onTouchEnd,   { passive: false });
    el.addEventListener("touchcancel", onTouchEnd,   { passive: false });
    return () => {
      el.removeEventListener("touchstart",  onTouchStart);
      el.removeEventListener("touchmove",   onTouchMove);
      el.removeEventListener("touchend",    onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);
  const showNames = scale >= SHOW_NAMES_AT;
  const showYears = scale >= SHOW_YEARS_AT;

  const activeId = mode === "explore" ? (selected || hovered) : null;
  const highlighted = new Set();
  if (activeId) {
    highlighted.add(activeId);
    const activeInfluences = activeId === "__user__"
      ? (userProfile?.influences || [])
      : (localEdits[activeId]?.influences ?? PHOTOGRAPHERS[activeId]?.influences ?? []);
    activeInfluences.forEach(i => highlighted.add(i));
    Object.entries(PHOTOGRAPHERS).forEach(([id, p]) => {
      const infl = localEdits[id]?.influences ?? p.influences;
      if (infl.includes(activeId)) highlighted.add(id);
    });
  }

  // Second-order connections — connections of highlighted nodes, capped at one degree out
  const secondOrder = new Set();
  if (activeId && highlighted.size > 0) {
    highlighted.forEach(hlId => {
      if (hlId === activeId) return;
      const infl = hlId === "__user__"
        ? (userProfile?.influences || [])
        : (localEdits[hlId]?.influences ?? PHOTOGRAPHERS[hlId]?.influences ?? []);
      infl.forEach(i => { if (!highlighted.has(i)) secondOrder.add(i); });
      Object.entries(PHOTOGRAPHERS).forEach(([id, p]) => {
        const pInfl = localEdits[id]?.influences ?? p.influences;
        if (pInfl.includes(hlId) && !highlighted.has(id)) secondOrder.add(id);
      });
    });
  }

  // Dispute helpers — defined early so pathEdges can use edgeKey
  const edgeKey = (a, b) => [a, b].sort().join("--");

  const pathSet   = pathResult ? new Set(pathResult) : new Set();
  const pathEdges = pathResult
    ? pathResult.slice(0, -1).map((id, i) => edgeKey(id, pathResult[i + 1]))
    : [];

  const currentP = selected && selected !== "__user__"
    ? { ...PHOTOGRAPHERS[selected], ...(localEdits[selected] || {}) }
    : null;
  const influenced = selected && selected !== "__user__"
    ? Object.entries(PHOTOGRAPHERS).filter(([, p]) => p.influences.includes(selected)).map(([id]) => id)
    : [];
  // Explore search — live filter as user types
  const exploreResults = exploreQuery.trim().length > 0
    ? Object.entries(PHOTOGRAPHERS)
        .filter(([, p]) => p.name.toLowerCase().includes(exploreQuery.toLowerCase()))
        .sort((a, b) => a[1].born - b[1].born)
        .slice(0, 6)
    : [];

  // Path search filtered list — includes the logged-in user at the top
  const filtered = [
    ...(userProfile && (!pathSearchQuery || userProfile.name.toLowerCase().includes(pathSearchQuery.toLowerCase()))
      ? [["__user__", { name: userProfile.name, born: userProfile.born, style: "You", isUser: true }]]
      : []),
    ...Object.entries(PHOTOGRAPHERS)
      .filter(([, p]) => p.name.toLowerCase().includes(pathSearchQuery.toLowerCase()))
      .sort((a, b) => a[1].born - b[1].born),
  ];

  // Era tick marks for x-axis context
  // Toggle node state: null → discovered → to-explore → null
  const cycleNodeState = (id) => {
    setNodeStates(prev => {
      const cur = prev[id] || null;
      const next = cur === null ? "to-explore"
        : cur === "to-explore" ? "discovered"
        : cur === "discovered" ? "influenced"
        : null;
      const n = { ...prev };
      if (next === null) delete n[id]; else n[id] = next;

      // Sync influences list — add when marking influenced, remove when clearing
      const currentInfluences = userProfile?.influences || [];
      if (next === "influenced" && !currentInfluences.includes(id)) {
        updateUser({ influences: [...currentInfluences, id] });
      } else if (next === null && cur === "influenced") {
        updateUser({ influences: currentInfluences.filter(i => i !== id) });
      }
      return n;
    });
  };

  // Filter derived values
  const allCountries = useMemo(() =>
    [...new Set(Object.values(PHOTOGRAPHERS).map(p => p.country))].sort()
  , [PHOTOGRAPHERS]);

  const allGenres = PHOTOGRAPHER_TAGS; // same list as add photographer form

  const filterActive = filterCountry || filterGenre;

  const filteredIds = useMemo(() => {
    if (!filterCountry && !filterGenre) return null; // null = show all
    return new Set(Object.entries(PHOTOGRAPHERS)
      .filter(([, p]) => {
        const countryMatch = !filterCountry || p.country === filterCountry;
        const genreMatch   = !filterGenre   || p.genre === filterGenre || (p.tags || []).includes(filterGenre);
        return countryMatch && genreMatch;
      })
      .map(([id]) => id));
  }, [PHOTOGRAPHERS, filterCountry, filterGenre]);

  // ── YOU MIGHT LIKE ────────────────────────────────────────────────────────
  // For each photographer not already in user's influences:
  // Score = (shared influences with user) + (they were influenced by same people as user)
  // Only shown when user has at least 1 influence
  const recommendations = useMemo(() => {
    if (!userProfile || !userProfile.influences?.length) return [];
    const myInfluences = new Set(userProfile.influences);
    const scores = {};

    Object.entries(PHOTOGRAPHERS).forEach(([id, p]) => {
      if (myInfluences.has(id)) return; // already an influence
      let score = 0;
      // Direct overlap: they were influenced by the same people as me
      const theirInfluences = new Set(localEdits[id]?.influences ?? p.influences);
      myInfluences.forEach(inf => { if (theirInfluences.has(inf)) score += 2; });
      // Indirect: my influences influenced them
      myInfluences.forEach(inf => {
        const infP = PHOTOGRAPHERS[inf];
        if (!infP) return;
        const infInfluenced = Object.entries(PHOTOGRAPHERS)
          .filter(([, q]) => (localEdits[q.id ?? '']?.influences ?? q.influences).includes(inf));
        if ((localEdits[id]?.influences ?? p.influences).includes(inf)) score += 1;
      });
      // Bonus: same genre as user
      if (p.genre === userProfile.genre) score += 1;
      if (score > 0) scores[id] = score;
    });

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
  }, [userProfile, PHOTOGRAPHERS, localEdits]);


  // Remaining dispute helpers (edgeKey defined above near pathEdges)

  // Open mailto to contribute a source or flag a dispute

  // ── ROUTING — all hooks declared above, safe to return early now ──

  const handleAuth = (u) => {
    freshUserRef.current = u;
    if (!u) setOnboarding(false); // skip intro overlay when skipping sign-in
    setAppView(u ? "profile" : "graph");
  };

  if (appView === "roadmap") return (
    <RoadmapPage
      onBack={() => setAppView(prevAppView || (user ? "profile" : "graph"))}
      PHOTOGRAPHERS={PHOTOGRAPHERS}
      totalConnections={Object.values(PHOTOGRAPHERS || {}).reduce((a, p) => a + (p.influences?.length || 0), 0)}
    />
  );

  if (appView === "privacy") return (
    <PrivacyPage onBack={() => setAppView(prevAppView || (user ? "profile" : "graph"))} />
  );

  if (appView === "sources") return (
    <SourcesPage onBack={() => { setAppView(user ? "profile" : "graph"); setSourcesFilter(null); }} PHOTOGRAPHERS={PHOTOGRAPHERS} filterName={sourcesFilter} />
  );

  // Show loading screen while Supabase checks session
  if (authLoading) return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville', serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: T.ink, marginBottom: 12 }}>Lineage</div>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", color: T.inkLight }}>LOADING…</div>
      </div>
    </div>
  );

  if (appView === "disclaimer") return (
    <DisclaimerPage
      feedbackUrl={FEEDBACK_URL}
      returning={!!localStorage.getItem(DISCLAIMER_KEY)}
      onPrivacy={() => navigateTo("privacy")}
      onRoadmap={() => navigateTo("roadmap")}
      onEnter={() => {
        localStorage.setItem(DISCLAIMER_KEY, "1");
        setAppView(user ? "profile" : "auth");
      }}
    />
  );

  if (appView === "auth") return <AuthScreen onAuth={handleAuth} />;

  if (appView === "profile") {
    if (!activeUser) return (
      <div style={{ width: "100%", height: "100dvh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville', serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: T.ink, marginBottom: 12 }}>Lineage</div>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: T.inkLight }}>LOADING…</div>
        </div>
      </div>
    );
    return (
    <ErrorBoundary>
    <ProfilePage
      user={activeUser}
      onExplore={() => { setAppView("graph"); setOnboarding(false); }}
      onAbout={() => navigateTo("disclaimer")}
      onRoadmap={() => navigateTo("roadmap")}
      onLogout={() => { logout(); setAppView("auth"); }}
      updateUser={updateUser}
      PHOTOGRAPHERS={PHOTOGRAPHERS}
    />
    </ErrorBoundary>
  );
  }

  // Loading state — shown while fetching photographers from Supabase
  if (dataLoading) return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville', serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: T.ink, marginBottom: 12 }}>Lineage</div>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", color: T.inkLight }}>LOADING…</div>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header style={{ padding: isMobile ? "11px 14px 9px" : "13px 26px 11px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", background: T.paper, flexShrink: 0, zIndex: 50, gap: 12, touchAction: "none" }} onTouchStart={e => e.stopPropagation()}>
        <div style={{ flexShrink: 0, cursor: "pointer" }} onClick={() => { setSelected(null); setSheetOpen(false); switchMode("explore"); }}>
          <div style={{ fontSize: isMobile ? 17 : 21, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>Lineage</div>
          {!isMobile && <div style={{ fontSize: 9.5, letterSpacing: "0.13em", color: T.inkLight, marginTop: 3 }}>Map your photographic influence</div>}
        </div>

        {/* Explore search bar — desktop inline, mobile overlay */}
        {mode === "explore" && !isMobile && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {exploreSearch ? (
              <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 320, position: "relative" }}>
                <input
                  ref={exploreInputRef}
                  autoFocus
                  value={exploreQuery}
                  onChange={e => setExploreQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Escape") { setExploreSearch(false); setExploreQuery(""); }
                    if (e.key === "Enter" && exploreResults.length > 0) {
                      const [id] = exploreResults[0];
                      setSelected(id); setSheetOpen(true);
                      setExploreSearch(false); setExploreQuery("");
                      panToNode(id);
                    }
                  }}
                  placeholder="Search photographers…"
                  style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "5px 24px 5px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none" }}
                />
                <button onClick={() => { setExploreSearch(false); setExploreQuery(""); exploreInputRef.current?.blur(); }}
                  style={{ position: "absolute", right: 0, background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                {exploreResults.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: T.paper, border: `1px solid ${T.border}`, zIndex: 400, boxShadow: "0 8px 24px rgba(26,24,18,0.1)", overflow: "hidden", maxHeight: "60dvh", overflowY: "auto" }}>
                    {exploreResults.map(([id, p], i) => (
                      <div key={id}
                        onClick={() => { setSelected(id); setSheetOpen(true); setExploreSearch(false); setExploreQuery(""); panToNode(id); }}
                        style={{ padding: "12px 14px", cursor: "pointer", borderBottom: i < exploreResults.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "baseline" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: 13.5, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>{p.name}</span>
                        <span style={{ fontSize: 9, color: T.inkLight }}>{p.born}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => { setExploreSearch(true); setTimeout(() => exploreInputRef.current?.focus(), 50); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.inkLight, display: "flex", alignItems: "center", gap: 5, fontSize: 11, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif", padding: "4px 8px" }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="5.5" cy="5.5" r="4" /><line x1="8.5" y1="8.5" x2="12" y2="12" />
                </svg>
                SEARCH
              </button>
            )}
          </div>
        )}

        {/* Mobile search — full screen overlay so keyboard doesn't displace footer */}
        {isMobile && exploreSearch && (
          <div style={{ position: "fixed", inset: 0, background: T.paper, zIndex: 500, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <input
                ref={exploreInputRef}
                autoFocus
                value={exploreQuery}
                onChange={e => setExploreQuery(e.target.value)}
                placeholder="Search photographers…"
                style={{ flex: 1, border: "none", padding: "6px 0", fontSize: 16, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none" }}
              />
              <button onClick={() => { setExploreSearch(false); setExploreQuery(""); exploreInputRef.current?.blur(); }}
                style={{ background: "none", border: "none", color: T.inkMid, cursor: "pointer", fontSize: 14, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif", padding: "4px 0" }}>
                CANCEL
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {exploreResults.map(([id, p], i) => (
                <div key={id}
                  onPointerDown={e => { e.preventDefault(); setSelected(id); setSheetOpen(true); setExploreSearch(false); setExploreQuery(""); panToNode(id); }}
                  style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "baseline" }}>
                  <span style={{ fontSize: 15, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: T.inkLight }}>{p.born}</span>
                </div>
              ))}
              {exploreQuery && exploreResults.length === 0 && (
                <p style={{ padding: "20px 16px", fontSize: 14, color: T.inkFaint, fontStyle: "italic" }}>No photographers found.</p>
              )}
            </div>
          </div>
        )}

        {!exploreSearch && mode === "explore" && !isMobile && (
          <div style={{ fontSize: 9, color: T.inkFaint, letterSpacing: "0.09em", transition: "opacity 0.4s", opacity: showNames ? 0 : 0.7, flexShrink: 0, pointerEvents: "none" }}>
            SCROLL FOR NAMES
          </div>
        )}

        <div style={{ marginLeft: mode === "explore" && exploreSearch ? 0 : "auto", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>

          {isMobile ? (
            /* ── MOBILE: burger menu for all controls ── */
            <>
              {/* Search icon stays visible */}
              {mode === "explore" && !exploreSearch && (
                <button onClick={() => { setExploreSearch(true); setTimeout(() => exploreInputRef.current?.focus(), 50); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: T.inkLight, padding: "4px 6px", display: "flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="5.5" cy="5.5" r="4" /><line x1="8.5" y1="8.5" x2="12" y2="12" />
                  </svg>
                </button>
              )}

              {/* Exit path button if in path mode */}
              {mode === "path" && (
                <button onClick={() => switchMode("explore")}
                  style={{ padding: "5px 10px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontSize: 10, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif" }}>
                  ← EXIT
                </button>
              )}

              {/* Burger */}
              {headerMenuOpen && <div onClick={() => setHeaderMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
              <div style={{ position: "relative" }}>
                <button onClick={() => setHeaderMenuOpen(m => !m)}
                  style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", padding: "5px 8px", display: "flex", flexDirection: "column", gap: 3.5, alignItems: "center", justifyContent: "center", width: 32, height: 28 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 14, height: 1.2, background: T.inkMid, borderRadius: 1 }} />)}
                </button>
                {headerMenuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: T.paper, border: `1px solid ${T.border}`, borderRadius: 2, boxShadow: "0 4px 16px rgba(26,24,18,0.12)", zIndex: 200, minWidth: 180, overflow: "hidden" }}>
                    {/* Filter */}
                    <button onClick={() => { setFilterOpen(o => !o); setHeaderMenuOpen(false); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 13, fontFamily: "'EB Garamond', serif", color: filterActive ? T.ink : T.inkMid, background: filterActive ? "rgba(26,24,18,0.04)" : "none", border: "none", cursor: "pointer", letterSpacing: "0.02em" }}>
                      {filterActive ? `Filter: ${[filterCountry, filterGenre].filter(Boolean).join(", ")}` : "Filter"}
                    </button>
                    {/* Admin buttons */}
                    {isAdmin && <>
                      <div style={{ height: 1, background: T.border }} />
                      <button onClick={() => { setShowAddPhotographer(true); setHeaderMenuOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 13, fontFamily: "'EB Garamond', serif", color: T.amber, background: "none", border: "none", cursor: "pointer" }}>
                        + Add photographer
                      </button>
                      <button onClick={() => { setShowAddConnection(true); setHeaderMenuOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 13, fontFamily: "'EB Garamond', serif", color: T.amber, background: "none", border: "none", cursor: "pointer" }}>
                        + Add connection
                      </button>
                    </>}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── DESKTOP: show all controls ── */
            <>
              <button onClick={() => setFilterOpen(o => !o)}
                style={{ padding: "5px 14px", background: filterActive ? T.ink : "transparent", border: `1px solid ${filterActive ? T.ink : T.border}`, borderRadius: 2, cursor: "pointer", color: filterActive ? T.bg : T.inkLight, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif", transition: "all 0.15s" }}>
                FILTER{filterActive ? ` ·${filterCountry ? " " + filterCountry : ""}${filterGenre ? " " + filterGenre : ""}` : ""}
              </button>
              {mode === "path" && (
                <button onClick={() => switchMode("explore")}
                  style={{ padding: "5px 14px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif" }}>
                  ← EXIT PATH
                </button>
              )}
              {isAdmin && (
                <>
                  <button onClick={() => setShowAddPhotographer(true)}
                    style={{ fontSize: 10, letterSpacing: "0.08em", padding: "5px 10px", background: T.amber, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif", whiteSpace: "nowrap" }}>
                    + PHOTOGRAPHER
                  </button>
                  <button onClick={() => setShowAddConnection(true)}
                    style={{ fontSize: 10, letterSpacing: "0.08em", padding: "5px 10px", background: "transparent", border: `1px solid ${T.amber}`, borderRadius: 2, cursor: "pointer", color: T.amber, fontFamily: "'EB Garamond', serif", whiteSpace: "nowrap" }}>
                    + CONNECTION
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* ── FILTER PANEL ── */}
      {filterOpen && (
        <div style={{ padding: isMobile ? "12px 14px" : "12px 26px", background: T.paper, borderBottom: `1px solid ${T.border}`, flexShrink: 0, zIndex: 45 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>

            {/* Country filter */}
            <div style={{ flex: 1, minWidth: isMobile ? "100%" : 200 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 7 }}>COUNTRY OF BIRTH</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {allCountries.map(c => (
                  <button key={c} onClick={() => setFilterCountry(filterCountry === c ? null : c)}
                    style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${filterCountry === c ? T.ink : T.border}`, borderRadius: 2, background: filterCountry === c ? T.ink : "transparent", color: filterCountry === c ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif", letterSpacing: "0.03em", transition: "all 0.12s" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre filter */}
            <div style={{ flex: 1, minWidth: isMobile ? "100%" : 200 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 7 }}>GENRE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {allGenres.map(g => (
                  <button key={g} onClick={() => setFilterGenre(filterGenre === g ? null : g)}
                    style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${filterGenre === g ? T.ink : T.border}`, borderRadius: 2, background: filterGenre === g ? T.ink : "transparent", color: filterGenre === g ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif", letterSpacing: "0.03em", transition: "all 0.12s" }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {filterActive && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={() => { setFilterCountry(null); setFilterGenre(null); }}
                  style={{ fontSize: 9, letterSpacing: "0.1em", color: T.inkLight, background: "none", border: "none", cursor: "pointer", padding: "0 4px", fontFamily: "'EB Garamond', serif" }}>
                  CLEAR ALL
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PATH BAR ── */}
      {mode === "path" && (
        <div style={{ padding: isMobile ? "7px 12px" : "7px 22px", background: T.paper, borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center", flexShrink: 0, zIndex: 40, flexWrap: "wrap" }}>
          {!pathFrom && !pathTo && (
            <span style={{ fontSize: 10.5, color: T.inkLight, fontStyle: "italic", marginRight: 4 }}>
              Find the shortest chain of influence between any two photographers —
            </span>
          )}
          <span style={{ fontSize: 9, letterSpacing: "0.12em", color: T.inkLight }}>FROM</span>
          <PathPicker value={pathFrom} isActive={searchTarget === "from"} placeholder="select" isMobile={isMobile} userProfile={userProfile}
            onClick={() => { setSearchTarget("from"); setSearchOpen(true); setPathSearchQuery(""); }} />
          <span style={{ color: T.inkFaint, fontSize: 13 }}>—</span>
          <span style={{ fontSize: 9, letterSpacing: "0.12em", color: T.inkLight }}>TO</span>
          <PathPicker value={pathTo} isActive={searchTarget === "to"} placeholder="select" isMobile={isMobile} userProfile={userProfile}
            onClick={() => { setSearchTarget("to"); setSearchOpen(true); setPathSearchQuery(""); }} />
          {(pathFrom || pathTo) && (
            <button onClick={() => { setPathFrom(null); setPathTo(null); setPathResult(null); }}
              style={{ marginLeft: "auto", background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 17, padding: 0 }}>×</button>
          )}
        </div>
      )}

      {mode === "path" && pathResult && (
        <div style={{ position: "relative", flexShrink: 0, zIndex: 40 }}>
          <div style={{ padding: "6px 16px", background: T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", overflowX: "auto", gap: 0 }}
            ref={el => el && (el.style.scrollbarWidth = "none")}>
            {pathResult.map((id, i) => (
              <span key={id} style={{ display: "flex", alignItems: "center" }}>
                <span onClick={() => { setSelected(id); setMode("explore"); setSheetOpen(true); }}
                  style={{ fontSize: 11.5, color: i <= pathStep ? T.ink : T.inkFaint, transition: "color 0.3s", cursor: "pointer", padding: "1px 5px", whiteSpace: "nowrap", borderBottom: i <= pathStep ? `1px solid ${T.ink}` : "1px solid transparent" }}>
                  {PHOTOGRAPHERS[id]?.name || (id === "__user__" && userProfile?.name) || id}
                </span>
                {i < pathResult.length - 1 && (
                  <span style={{ color: T.inkFaint, fontSize: 10, padding: "0 1px" }}> · </span>
                )}
              </span>
            ))}
            <span style={{ marginLeft: 10, fontSize: 8.5, color: T.inkLight, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              {pathResult.length - 1} step{pathResult.length !== 2 ? "s" : ""}
            </span>
          </div>
          {/* Right fade — signals scrollable content */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: `linear-gradient(to right, transparent, ${T.bg})`, pointerEvents: "none" }} />
        </div>
      )}

      {mode === "path" && pathFrom && pathTo && !pathResult && (
        <div style={{ padding: "6px 16px", background: "#fff8f5", borderBottom: "1px solid rgba(160,60,40,0.12)", fontSize: 10.5, color: "rgba(140,50,30,0.65)", flexShrink: 0 }}>
          No connection found.
        </div>
      )}

      {/* ── GRAPH ── */}
      <style>{`
        @keyframes nodeSelect {
          0%   { r: ${(3.5 + 13.5 + 5.5).toFixed(1)}; opacity: 0.4; }
          60%  { r: ${(3.5 + 13.5 + 14).toFixed(1)};  opacity: 0.12; }
          100% { r: ${(3.5 + 13.5 + 20).toFixed(1)};  opacity: 0; }
        }
        @keyframes rippleOut  { 0% { r:4; stroke-opacity:.55; } 100% { r:90;  stroke-opacity:0; } }
        @keyframes rippleOut2 { 0% { r:4; stroke-opacity:.3;  } 100% { r:140; stroke-opacity:0; } }
        @keyframes rippleOut3 { 0% { r:4; stroke-opacity:.15; } 100% { r:180; stroke-opacity:0; } }
        @keyframes edgePulse  { 0% { stroke-opacity:0; } 20% { stroke-opacity:.35; } 100% { stroke-opacity:0; } }
        .node-pulse { animation: nodeSelect 0.55s ease-out forwards; }
        .rp1 { animation: rippleOut  1.1s cubic-bezier(.1,0,.6,1) forwards; }
        .rp2 { animation: rippleOut2 1.5s cubic-bezier(.1,0,.5,1) forwards; animation-delay:.12s; }
        .rp3 { animation: rippleOut3 1.9s cubic-bezier(.1,0,.4,1) forwards; animation-delay:.28s; }
      `}</style>
      <div ref={containerRef}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
        style={{ flex: 1, position: "relative", overflow: "hidden", cursor: isPanning ? "grabbing" : "crosshair", touchAction: "none" }}
      >
        {/* Filter empty state */}
        {filteredIds && filteredIds.size === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
            <div style={{ textAlign: "center", padding: "0 32px" }}>
              <p style={{ fontSize: 15, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7, marginBottom: 14 }}>
                No photographers match this filter.
              </p>
              <p style={{ fontSize: 12, color: T.inkFaint, lineHeight: 1.6 }}>
                Try a different country or genre combination.
              </p>
            </div>
          </div>
        )}
        {/* paper texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.016'/%3E%3C/svg%3E")`,
        }} />

        {/* ── RIPPLE LAYER ── */}
        {ripples.map(ripple => (
          <svg key={ripple.key} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 8, overflow: "visible" }}>
            <circle cx={ripple.x} cy={ripple.y} r={0} fill="none" stroke={T.inkMid} strokeWidth={1.2} className="rp1" />
            <circle cx={ripple.x} cy={ripple.y} r={0} fill="none" stroke={T.inkFaint} strokeWidth={0.7} className="rp2" />
            <circle cx={ripple.x} cy={ripple.y} r={0} fill="none" stroke={T.inkFaint} strokeWidth={0.4} className="rp3" />
            {ripple.waves.map((degreeNodes, d) =>
              degreeNodes.map(nbId => {
                const nbPos = scaledPos[nbId];
                if (!nbPos) return null;
                return (
                  <line key={nbId}
                    x1={ripple.x} y1={ripple.y}
                    x2={nbPos.x + pan.x} y2={nbPos.y + pan.y}
                    stroke={T.inkFaint}
                    strokeWidth={Math.max(0.3, 0.8 - d * 0.18)}
                    strokeOpacity={0}
                    style={{ animation: `edgePulse ${0.5 + d * 0.1}s ease-out ${(d + 1) * 0.18}s forwards` }}
                  />
                );
              })
            )}
          </svg>
        ))}

        {/* Transformable world — pan only, zoom handled by scaledPos spread */}
        <div style={{ position: "absolute", inset: 0, transform: `translate(${pan.x}px, ${pan.y}px)`, transformOrigin: "center center" }}>

          <svg style={{ position: "absolute", inset: 0, width: dims.w * 3, height: dims.h, overflow: "visible", zIndex: 1 }}>

            {/* Edges — use localEdits influences if present */}
            {Object.entries(PHOTOGRAPHERS).map(([id, p]) => {
              const influences = (localEdits[id]?.influences ?? p.influences);
              return influences.map(infId => {
                if (!scaledPos[id] || !scaledPos[infId]) return null;
                const from = scaledPos[id], to = scaledPos[infId];
                const eKey = edgeKey(id, infId);
                const isPathEdge = pathEdges.includes(eKey);
                const pathIdxA = pathResult ? pathResult.indexOf(id) : -1;
                const pathIdxB = pathResult ? pathResult.indexOf(infId) : -1;
                const pathIdx = (pathIdxA >= 0 && pathIdxB >= 0) ? Math.min(pathIdxA, pathIdxB) : -1;
                const isLit      = isPathEdge && pathIdx >= 0 && pathIdx < pathStep;
                const isHL       = !!(activeId && (id === activeId || infId === activeId));
                const disputed   = false;
                const edgeInFilter = !filteredIds || (filteredIds.has(id) && filteredIds.has(infId));

                // At rest: show faint edges for high-connectivity pairs
                const atRestOpacity = (!activeId && !filteredIds)
                  ? ((connCounts[id] + connCounts[infId]) > 9 ? 0.1 : (connCounts[id] + connCounts[infId]) > 5 ? 0.05 : 0)
                  : 0;

                // Second-order: edge connects a highlighted node to a second-order node
                const isSecondOrder = !isHL && activeId && (
                  (highlighted.has(id) && secondOrder.has(infId)) ||
                  (highlighted.has(infId) && secondOrder.has(id))
                );

                return (
                  <line key={`${id}-${infId}`}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={
                      isLit || isHL
                        ? T.ink
                        : T.line
                    }
                    strokeWidth={isLit ? 1.5 : isHL ? 0.9 : 0.45}
                    strokeOpacity={
                      !edgeInFilter ? 0
                      : isLit ? 1
                      : isHL ? 0.65
                      : atRestOpacity
                    }
                    strokeDasharray="none"
                    style={{ transition: "stroke-opacity 0.2s, stroke-width 0.2s" }}
                  />
                );
              });
            })}

            {/* User edges */}
            {userProfile && scaledPos["__user__"] && (userProfile.influences || []).map(infId => {
              if (!scaledPos[infId]) return null;
              const from = scaledPos["__user__"], to = scaledPos[infId];
              return (
                <line key={`__user__-${infId}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={T.amber} strokeWidth={0.8} strokeOpacity={0.5}
                  strokeDasharray="3 4"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {Object.entries(PHOTOGRAPHERS).map(([id, p]) => {
            if (!scaledPos[id]) return null;
            const pos = scaledPos[id];
            const isSel     = selected === id;
            const isHov     = hovered === id;
            const isInPath  = pathSet.has(id);
            const pathIdx   = pathResult ? pathResult.indexOf(id) : -1;
            const isLitNode = pathResult && pathIdx >= 0 && pathIdx <= pathStep;
            const inHL      = highlighted.size > 0 && highlighted.has(id);
            const exploreActive = mode === "explore" && highlighted.size > 0;

            const inFilter = !filteredIds || filteredIds.has(id);
            const opacity = mode === "path"
              ? (!inFilter ? 0.07
                : pathResult ? (isInPath ? 1 : 0.13)
                : (pathFrom === id || pathTo === id ? 1 : 0.35))
              : (exploreActive
                  ? (inHL ? 1 : 0.07)
                  : (inFilter ? 1 : 0.1));

            const activeInfluences = activeId
              ? activeId === "__user__"
                ? (userProfile?.influences || [])
                : (localEdits[activeId]?.influences ?? PHOTOGRAPHERS[activeId]?.influences ?? [])
              : [];
            const isInfluencer = activeId && activeInfluences.includes(id);
            const isInfluenced = activeId && id !== activeId && (localEdits[id]?.influences ?? PHOTOGRAPHERS[id]?.influences ?? []).includes(activeId);

            const connNorm = connCounts[id] / maxConn;
            const BASE = 3.5, RANGE = 13.5;
            const r = isLitNode ? BASE + RANGE + 3.5
              : (isSel && mode !== "path") ? BASE + RANGE + 3.5
              : (isHov && mode !== "path") ? BASE + RANGE + 2
              : BASE + connNorm * RANGE;

            const nodeState = nodeStates[id] || null;
            const isDiscovered    = nodeState === "discovered";
            const isToExplore     = nodeState === "to-explore";
            const isUserInfluence = nodeState === "influenced";
            const fill = isInfluencer ? T.blue : isInfluenced ? T.red : T.ink;
            const ringColor = isUserInfluence ? T.amber : isDiscovered ? "#4a7fa5" : isToExplore ? "#4a8a5a" : null;

            // Label above for nodes in lower 38% of canvas
            const labelAbove = scaledPos[id] && scaledPos[id].y > dims.h * 0.62;

            return (
              <div key={id} className="node"
                onMouseEnter={() => {
                  if (isMobile) return;
                  setHovered(id);
                  // Fire ripple from this node
                  const srcPos = scaledPos[id];
                  if (!srcPos) return;
                  const key = rippleKeyRef.current++;
                  // BFS waves
                  const visited = new Set([id]);
                  const waves = [];
                  let frontier = [id];
                  for (let d = 0; d < 4 && frontier.length > 0; d++) {
                    const next = [];
                    frontier.forEach(fid => {
                      const fp = PHOTOGRAPHERS[fid];
                      if (!fp) return;
                      [...fp.influences, ...Object.keys(PHOTOGRAPHERS).filter(k => PHOTOGRAPHERS[k].influences.includes(fid))]
                        .forEach(nbId => {
                          if (!visited.has(nbId) && PHOTOGRAPHERS[nbId]) { visited.add(nbId); next.push(nbId); }
                        });
                    });
                    if (next.length) waves.push(next);
                    frontier = next;
                  }
                  setRipples(prev => [...prev.slice(-3), { key, sourceId: id, x: srcPos.x + pan.x, y: srcPos.y + pan.y, waves }]);
                  setTimeout(() => setRipples(prev => prev.filter(r => r.key !== key)), 2400);
                }}
                onMouseLeave={() => !isMobile && setHovered(null)}
                onClick={() => handleNodeTap(id)}
                style={{
                  position: "absolute",
                  left: pos.x, top: pos.y,
                  transform: "translate(-50%, -50%)",
                  width: 22, height: 22,
                  opacity,
                  transition: "opacity 0.35s ease",
                  zIndex: isSel ? 20 : isHov ? 15 : 5,
                  cursor: "pointer", userSelect: "none",
                }}
              >
                {/* Name label — floats above or below dot */}
                <div style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  [labelAbove ? "bottom" : "top"]: "calc(100% + 4px)",
                  fontSize: 9.5, fontFamily: "'EB Garamond', serif",
                  color: isSel || isLitNode ? T.ink : T.inkMid,
                  fontWeight: isSel ? 600 : 400,
                  letterSpacing: "0.025em",
                  textAlign: "center", lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  opacity: showNames || isSel || isHov || isInPath || connNorm > 0.5 ? 1 : 0,
                  transition: "opacity 0.4s",
                  pointerEvents: "none",
                  background: `rgba(${T.bg === "#f9f7f2" ? "249,247,242" : "249,247,242"},0.82)`,
                  padding: "1px 3px",
                  borderRadius: 2,
                }}>
                  {p.name.split(" ").map((w, i, arr) =>
                    arr.length > 2 && i < arr.length - 1 ? w[0] + "." : w
                  ).join(" ")}
                </div>

                {/* Dot — centred exactly at pos.x, pos.y */}
                <svg width={22} height={22} style={{ overflow: "visible", position: "absolute", top: 0, left: 0 }}>
                  {(isSel || isLitNode) && (
                    <circle cx={11} cy={11} r={r + 5.5} fill="none" stroke={T.ink} strokeWidth={0.5} strokeOpacity={0.15} />
                  )}
                  {ringColor && (
                    <circle cx={11} cy={11} r={r + 3.5} fill="none" stroke={ringColor} strokeWidth={1.5} strokeOpacity={0.7} />
                  )}
                  {pulsingNode === id && (
                    <circle cx={11} cy={11} r={r + 5.5} fill="none" stroke={T.ink} strokeWidth={1} className="node-pulse" />
                  )}
                  <circle cx={11} cy={11} r={r} fill={fill}
                    stroke={isSel || isLitNode ? T.ink : "none"} strokeWidth={0.8}
                    style={{ transition: "r 0.2s ease, fill 0.18s" }}
                  />
                </svg>

                {/* Expanded tap target */}
                <div style={{ position: "absolute", inset: -14, borderRadius: "50%" }} />
              </div>
            );
          })}

          {/* ── USER NODE ── */}
          {userProfile && scaledPos["__user__"] && (() => {
            const pos = scaledPos["__user__"];
            const isSel = selected === "__user__";
            const isHov = hovered === "__user__";
            const labelAbove = pos.y > dims.h * 0.62;
            return (
              <div key="__user__" className="node"
                onMouseEnter={() => !isMobile && setHovered("__user__")}
                onMouseLeave={() => !isMobile && setHovered(null)}
                onClick={() => handleNodeTap("__user__")}
                style={{
                  position: "absolute", left: pos.x, top: pos.y,
                  transform: "translate(-50%, -50%)",
                  width: 22, height: 22,
                  zIndex: isSel ? 20 : isHov ? 15 : 10,
                  cursor: "pointer", userSelect: "none",
                }}>
                <div style={{
                  position: "absolute",
                  left: "50%", transform: "translateX(-50%)",
                  [labelAbove ? "bottom" : "top"]: "calc(100% + 4px)",
                  fontSize: 9.5, fontFamily: "'EB Garamond', serif",
                  color: T.amber, fontWeight: 600, letterSpacing: "0.025em",
                  textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap",
                  opacity: showNames || isSel || isHov ? 1 : 0,
                  transition: "opacity 0.4s", pointerEvents: "none",
                }}>
                  {userProfile.name}
                </div>
                <svg width={22} height={22} style={{ overflow: "visible", position: "absolute", top: 0, left: 0 }}>
                  {isSel && <circle cx={11} cy={11} r={12} fill="none" stroke={T.amber} strokeWidth={0.5} strokeOpacity={0.25} />}
                  <circle cx={11} cy={11} r={isSel ? 9 : isHov ? 8 : 6.5}
                    fill={T.amber} stroke={T.amber} strokeWidth={0.8}
                    style={{ transition: "r 0.18s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: -14, borderRadius: "50%" }} />
              </div>
            );
          })()}
        </div>

        {/* Zoom hint — fades once names visible */}
        <div style={{
          position: "absolute", top: 12, right: 14, zIndex: 10, pointerEvents: "none",
          fontSize: 9, color: T.inkFaint, letterSpacing: "0.1em",
          opacity: showNames ? 0 : 1, transition: "opacity 0.5s",
        }}>
          {isMobile ? "PINCH TO REVEAL NAMES" : "SCROLL IN TO REVEAL NAMES"}
        </div>
      </div>

      {/* ── BOTTOM SHEET ── */}
      <div style={{
        flexShrink: 0,
        height: sheetOpen && currentP && selected !== "__user__" ? (editMode ? (isMobile ? "70dvh" : "340px") : (isMobile ? "52dvh" : "280px")) : 0,
        background: T.paper, borderTop: sheetOpen && currentP && selected !== "__user__" ? `1px solid ${T.border}` : "none",
        transition: "height 0.3s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden", zIndex: 60, display: "flex", flexDirection: "column",
      }}>
        {currentP && (
          <>
            {/* ── SHEET HEADER ── */}
            <div style={{ padding: "11px 18px 9px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", gap: 14, flexShrink: 0 }}>
              <div style={{ width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: "50%", background: T.amber, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: isMobile ? 18 : 22, fontFamily: "'Libre Baskerville', serif", color: T.bg, fontWeight: 600 }}>
                  {(currentP.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 8.5, letterSpacing: "0.13em", color: T.inkLight, marginBottom: 2 }}>
                      {[currentP.country, currentP.born].filter(Boolean).join(" · ")}
                    </div>
                    <div style={{ fontSize: isMobile ? 16 : 21, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1.1, whiteSpace: isMobile ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {currentP.name}
                    </div>
                    {/* Genre tags — match filter categories */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                      {(currentP.tags || (currentP.genre ? [currentP.genre] : [])).map((tag, i) => (
                        <span key={tag} onClick={() => { setFilterGenre(tag); setFilterOpen(false); }}
                          style={{ fontSize: 9, letterSpacing: "0.08em", padding: "2px 7px", border: `1px solid ${i === 0 ? T.ink : T.border}`, borderRadius: 10, background: i === 0 ? "rgba(26,24,18,0.06)" : "transparent", color: i === 0 ? T.ink : T.inkLight, cursor: "pointer", fontFamily: "'EB Garamond', serif" }}
                          title="Filter by this genre">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    {/* Edit / Save / Cancel buttons */}
                    {!editMode ? (
                      <button
                        onClick={() => { setEditDraft({ bio: currentP.bio, tags: currentP.tags || [], links: { ...currentP.links }, influences: [...(currentP.influences || [])] }); setInfSearch(""); setEditMode(true); }}
                        title="Edit profile"
                        style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 2, color: T.inkLight, cursor: "pointer", fontSize: 11, padding: "3px 7px", letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
                        EDIT
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setLocalEdits(prev => ({ ...prev, [selected]: editDraft }));
                            setEditMode(false); setEditDraft(null);
                          }}
                          style={{ background: T.ink, border: "none", borderRadius: 2, color: T.bg, cursor: "pointer", fontSize: 11, padding: "3px 9px", letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
                          SAVE
                        </button>
                        <button
                          onClick={() => { setEditMode(false); setEditDraft(null); setInfSearch(""); }}
                          style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 2, color: T.inkLight, cursor: "pointer", fontSize: 11, padding: "3px 7px", letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
                          CANCEL
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setSelected(null); setSheetOpen(false); setEditMode(false); zoomOut(); }}
                      style={{ background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 19, padding: 0, lineHeight: 1, marginTop: 2 }}>×</button>
                  </div>
                </div>
                {!editMode && mode === "explore" && (
                  <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                    <button onClick={() => { switchMode("path", { keepPath: true }); setPathFrom(selected); setSheetOpen(false); setSelected(null); }}
                      style={{ fontSize: 8.5, letterSpacing: "0.1em", padding: "4px 8px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif" }}>
                      TRACE PATH →
                    </button>
                    <button onClick={() => { setSourcesFilter(currentP.name); setAppView("sources"); }}
                      style={{ fontSize: 8.5, letterSpacing: "0.1em", padding: "4px 8px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif" }}>
                      SOURCES ↗
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── SHEET BODY ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "11px 18px 16px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 18 }}>

              {editMode && editDraft ? (
                /* ── EDIT FORM ── */
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 8 }}>GENRE</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {PHOTOGRAPHER_TAGS.map(tag => {
                        const sel = (editDraft.tags || []).includes(tag);
                        return (
                          <button key={tag} type="button"
                            onClick={() => setEditDraft(d => ({ ...d, tags: sel ? (d.tags || []).filter(t => t !== tag) : [...(d.tags || []), tag] }))}
                            style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${sel ? T.ink : T.border}`, borderRadius: 2, background: sel ? T.ink : "transparent", color: sel ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif" }}>
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>BIO</div>
                    <textarea
                      value={editDraft.bio}
                      onChange={e => setEditDraft(d => ({ ...d, bio: e.target.value }))}
                      rows={3}
                      style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "4px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.ink, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                    />
                  </div>

                  {/* ── CONNECTIONS EDITOR ── */}
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.blue, marginBottom: 8 }}>INFLUENCED BY</div>

                    {/* Current connection tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                      {(editDraft.influences || []).map(infId => {
                        const disputed = false;
                        return (
                          <div key={infId} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "3px 8px 3px 10px",
                            border: `1px solid rgba(74,111,165,0.3)`,
                            borderRadius: 2,
                            background: "rgba(74,111,165,0.05)",
                          }}>
                            <span style={{ fontSize: 11.5, color: T.blue, fontFamily: "'EB Garamond', serif" }}>
                              {PHOTOGRAPHERS[infId]?.name || infId}
                            </span>
                            
                            
                            
                            <button
                              onClick={() => setEditDraft(d => ({ ...d, influences: d.influences.filter(i => i !== infId) }))}
                              style={{ background: "none", border: "none", color: "rgba(74,111,165,0.4)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1, marginTop: 1 }}>
                              ×
                            </button>
                          </div>
                        );
                      })}
                      {(editDraft.influences || []).length === 0 && (
                        <span style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic", fontFamily: "'EB Garamond', serif" }}>No connections yet</span>
                      )}
                    </div>

                    {/* Search to add */}
                    <div style={{ position: "relative" }}>
                      <input
                        value={infSearch}
                        onChange={e => setInfSearch(e.target.value)}
                        placeholder="Add a connection…"
                        style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "4px 0", fontSize: 12, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }}
                      />
                      {infSearch.trim().length > 0 && (() => {
                        const current = new Set(editDraft.influences || []);
                        const matches = Object.entries(PHOTOGRAPHERS)
                          .filter(([id, p]) => id !== selected && !current.has(id) && p.name.toLowerCase().includes(infSearch.toLowerCase()))
                          .slice(0, 5);
                        return matches.length > 0 ? (
                          <div style={{
                            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                            background: T.paper, border: `1px solid ${T.border}`,
                            boxShadow: "0 6px 20px rgba(26,24,18,0.09)", zIndex: 10, overflow: "hidden",
                          }}>
                            {matches.map(([id, p], i) => (
                              <div key={id}
                                onClick={() => { setEditDraft(d => ({ ...d, influences: [...(d.influences || []), id] })); setInfSearch(""); }}
                                style={{ padding: "8px 12px", cursor: "pointer", borderBottom: i < matches.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 8, alignItems: "baseline", transition: "background 0.1s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(74,111,165,0.05)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <span style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>{p.name}</span>
                                <span style={{ fontSize: 9, color: T.inkLight, letterSpacing: "0.04em" }}>{p.born} · {p.style}</span>
                              </div>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>LINKS</div>
                    {["website", "instagram", "book"].map(type => (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 9, letterSpacing: "0.1em", color: T.inkFaint, width: 60, flexShrink: 0 }}>{type.toUpperCase()}</span>
                        <input
                          value={editDraft.links[type] || ""}
                          onChange={e => setEditDraft(d => ({ ...d, links: { ...d.links, [type]: e.target.value || null } }))}
                          placeholder={`https://`}
                          style={{ flex: 1, border: "none", borderBottom: `1px solid ${T.border}`, padding: "3px 0", fontSize: 11, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none" }}
                        />
                      </div>
                    ))}
                  </div>
                  {localEdits[selected] && (
                    <button
                      onClick={() => { setLocalEdits(prev => { const n = { ...prev }; delete n[selected]; return n; }); setEditMode(false); setEditDraft(null); }}
                      style={{ alignSelf: "flex-start", background: "none", border: "none", fontSize: 10, color: T.red, cursor: "pointer", letterSpacing: "0.08em", padding: 0, fontFamily: "'EB Garamond', serif" }}>
                      RESET TO ORIGINAL
                    </button>
                  )}
                </div>
              ) : (
                /* ── READ VIEW ── */
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, lineHeight: 1.75, color: T.inkMid, margin: "0 0 11px", fontStyle: "italic" }}>
                      {currentP.bio}
                    </p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {currentP.influences.length > 0 && (
                        <div>
                          <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.blue, marginBottom: 5 }}>INFLUENCED BY</div>
                          {currentP.influences.map(infId => {
                            const disputed = false;
                            return (
                              <div key={infId} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <span onClick={() => { setSelected(infId); setSheetOpen(true); panToNode(infId); }}
                                  style={{ fontSize: 12.5, color: T.blue, cursor: "pointer", borderBottom: `1px solid rgba(74,111,165,0.22)`, paddingBottom: 1 }}>
                                  {PHOTOGRAPHERS[infId]?.name}
                                </span>
                                
                                
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {influenced.length > 0 && (
                        <div>
                          <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.red, marginBottom: 5 }}>INFLUENCED</div>
                          {influenced.map(infId => (
                            <span key={infId} onClick={() => { setSelected(infId); setSheetOpen(true); panToNode(infId); }}
                              style={{ fontSize: 12.5, color: T.red, cursor: "pointer", borderBottom: `1px solid rgba(138,64,64,0.22)`, paddingBottom: 1, marginRight: 11, display: "inline-block", marginBottom: 3 }}>
                              {PHOTOGRAPHERS[infId]?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ width: isMobile ? "auto" : 142, flexShrink: 0 }}>
                    {/* Node state toggle — only shown when user is on graph */}
                    {userProfile && selected !== "__user__" && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 6 }}>YOUR PATH</div>
                        {(() => {
                          const s = nodeStates[selected] || null;
                          const stateStyles = {
                            "to-explore":  { border: "#4a8a5a", bg: "rgba(74,138,90,0.08)",   color: "#4a8a5a",  label: "◎ To Explore" },
                            "discovered":  { border: "#4a7fa5", bg: "rgba(74,127,165,0.08)",  color: "#4a7fa5",  label: "✓ Discovered" },
                            "influenced":  { border: T.amber,   bg: `rgba(160,96,32,0.08)`,   color: T.amber,    label: "★ Influenced by" },
                          };
                          const cur = stateStyles[s];
                          const nextLabel = s === null ? "+ Mark as…"
                            : s === "to-explore" ? "→ Discovered"
                            : s === "discovered" ? "→ Influenced by"
                            : "→ Clear";
                          return (
                            <>
                              <button onClick={() => cycleNodeState(selected)}
                                style={{
                                  width: "100%", padding: "6px 8px", cursor: "pointer",
                                  border: `1px solid ${cur ? cur.border : T.border}`,
                                  borderRadius: 2, fontFamily: "'EB Garamond', serif",
                                  fontSize: 10.5, letterSpacing: "0.08em",
                                  background: cur ? cur.bg : "transparent",
                                  color: cur ? cur.color : T.inkLight,
                                  transition: "all 0.15s",
                                }}>
                                {cur ? cur.label : "+ Mark as…"}
                              </button>
                              {s && (
                                <button onClick={() => cycleNodeState(selected)}
                                  style={{ marginTop: 4, fontSize: 8.5, color: T.inkFaint, background: "none", border: "none", cursor: "pointer", padding: 0, letterSpacing: "0.06em", fontFamily: "'EB Garamond', serif" }}>
                                  {nextLabel}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 6 }}>EXPLORE</div>
                    <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 6, flexWrap: "wrap" }}>
                      {Object.entries(currentP.links).filter(([, v]) => v).map(([type, url]) => {
                        const isPrimary = type === "website" || type === "book";
                        return (
                          <a key={type} href={url} target="_blank" rel="noopener noreferrer"
                            style={{
                              fontSize: 11, letterSpacing: "0.08em", textDecoration: "none",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "7px 10px", gap: 8, borderRadius: 2,
                              background: isPrimary ? T.ink : "transparent",
                              border: `1px solid ${isPrimary ? T.ink : T.border}`,
                              color: isPrimary ? T.bg : T.inkMid,
                              transition: "opacity 0.15s",
                              fontFamily: "'EB Garamond', serif",
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                          >
                            {LINK_LABELS[type]} <span style={{ fontSize: 10, opacity: 0.7 }}>↗</span>
                          </a>
                        );
                      })}
                    </div>
                    {localEdits[selected] && (
                      <div style={{ marginTop: 8, fontSize: 8.5, color: T.inkLight, letterSpacing: "0.06em", fontStyle: "italic" }}>
                        · edited locally
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── PATH SEARCH OVERLAY ── */}
      {searchOpen && (
        <div style={{ position: "absolute", inset: 0, background: T.paper, zIndex: 80, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "13px 16px 9px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 8.5, letterSpacing: "0.13em", color: T.inkLight }}>
              SELECT {(searchTarget || "").toUpperCase()} PHOTOGRAPHER
            </div>
            <button onClick={() => { setSearchOpen(false); setSearchTarget(null); setPathSearchQuery(""); }}
              style={{ marginLeft: "auto", background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 19, padding: 0 }}>×</button>
          </div>
          <div style={{ padding: "9px 16px", borderBottom: `1px solid ${T.border}` }}>
            <input autoFocus value={pathSearchQuery} onChange={e => setPathSearchQuery(e.target.value)} placeholder="Search by name…"
              style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 15, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map(([id, p]) => (
              <div key={id}
                onClick={() => {
                  if (searchTarget === "from") setPathFrom(id); else setPathTo(id);
                  setSearchOpen(false); setSearchTarget(null); setPathSearchQuery("");
                }}
                style={{ padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${T.border}`, background: ((searchTarget === "from" ? pathFrom : pathTo) === id) ? "rgba(26,24,18,0.04)" : "transparent", display: "flex", gap: 10, alignItems: "baseline" }}>
                <div style={{ fontSize: 14.5, fontFamily: "'Libre Baskerville', serif", color: p.isUser ? T.amber : T.ink }}>{p.name}</div>
                <div style={{ fontSize: 9.5, color: T.inkLight, letterSpacing: "0.04em" }}>{p.isUser ? "your profile" : `${p.born} · ${p.style}`}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <LighthouseLightbox
          works={lightbox.works}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* ── ADMIN MODALS ── */}
      {showAddPhotographer && (
        <AddPhotographerModal
          onClose={() => setShowAddPhotographer(false)}
          onSaved={(p) => {
            setShowAddPhotographer(false);
            setNewlySavedPhotographer(p);
          }}
        />
      )}
      {showAddConnection && (
        <AddConnectionModal
          photographers={PHOTOGRAPHERS}
          onClose={() => setShowAddConnection(false)}
          onSaved={() => setShowAddConnection(false)}
        />
      )}

      {/* Post-save prompt — offer to add connection immediately */}
      {newlySavedPhotographer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,24,18,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => setNewlySavedPhotographer(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 580, background: T.paper, borderRadius: "4px 4px 0 0", padding: "24px 22px 28px" }}>
            <div style={{ fontSize: 16, fontFamily: "'Libre Baskerville', serif", fontWeight: 600, marginBottom: 8 }}>
              {newlySavedPhotographer.name} added
            </div>
            <p style={{ fontSize: 14, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 20px" }}>
              Would you like to add a connection for this photographer now?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setNewlySavedPhotographer(null); setShowAddConnection(true); }}
                style={{ flex: 1, padding: "9px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif" }}>
                + ADD CONNECTION
              </button>
              <button onClick={() => setNewlySavedPhotographer(null)}
                style={{ padding: "9px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontSize: 10.5, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div onTouchStart={e => e.stopPropagation()} style={{ padding: "5px 14px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", background: T.paper, flexShrink: 0, zIndex: 30, gap: 10, overflow: "hidden", touchAction: "none" }}>
        {/* Legend — hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
            {[{ c: T.blue, l: "INFLUENCED BY" }, { c: T.red, l: "INFLUENCED" }].map(({ c, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />{l}
              </div>
            ))}
            {userProfile && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
                  <svg width={12} height={12}><circle cx={6} cy={6} r={4} fill="none" stroke="#4a8a5a" strokeWidth={1.5}/></svg>
                  TO EXPLORE
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
                  <svg width={12} height={12}><circle cx={6} cy={6} r={4} fill="none" stroke="#4a7fa5" strokeWidth={1.5}/></svg>
                  DISCOVERED
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
                  <svg width={12} height={12}><circle cx={6} cy={6} r={4} fill="none" stroke={T.amber} strokeWidth={1.5}/></svg>
                  INFLUENCED BY
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {/* Profile / Sign in — always visible */}
          {activeUser ? (
            <button onClick={() => setAppView("profile")}
              style={{ fontSize: 9, letterSpacing: "0.1em", padding: "4px 10px", background: T.amber, border: `1px solid ${T.amber}`, borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif", whiteSpace: "nowrap" }}>
              ← MY PROFILE
            </button>
          ) : (
            <button onClick={() => setAppView("auth")}
              style={{ fontSize: 9, letterSpacing: "0.1em", padding: "4px 10px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif", whiteSpace: "nowrap" }}>
              SIGN IN
            </button>
          )}

          {/* Desktop — show all buttons */}
          {!isMobile && (
            <>
              <div style={{ fontSize: 8, letterSpacing: "0.09em", color: T.inkFaint, whiteSpace: "nowrap" }}>
                {Object.keys(PHOTOGRAPHERS || {}).length} photographers · {Object.values(PHOTOGRAPHERS || {}).reduce((a, p) => a + (p.influences?.length || 0), 0)} connections
              </div>
              <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 8.5, letterSpacing: "0.1em", color: T.bg, textDecoration: "none", background: T.amber, padding: "3px 9px", borderRadius: 2, whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
                SHARE FEEDBACK
              </a>
              <button onClick={() => navigateTo("sources")}
                style={{ fontSize: 8.5, letterSpacing: "0.08em", color: T.inkLight, background: "transparent", border: `1px solid ${T.border}`, padding: "3px 9px", borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
                SOURCES
              </button>
              <button onClick={() => navigateTo("roadmap")}
                style={{ fontSize: 8.5, letterSpacing: "0.08em", color: T.inkLight, background: "transparent", border: `1px solid ${T.border}`, padding: "3px 9px", borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
                ROADMAP
              </button>
              <button onClick={() => navigateTo("privacy")}
                style={{ fontSize: 8.5, letterSpacing: "0.08em", color: T.inkLight, background: "transparent", border: `1px solid ${T.border}`, padding: "3px 9px", borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
                PRIVACY
              </button>
              <button onClick={() => navigateTo("disclaimer")}
                style={{ fontSize: 8.5, letterSpacing: "0.08em", color: T.inkLight, background: "transparent", border: `1px solid ${T.border}`, padding: "3px 9px", borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
                ABOUT
              </button>
            </>
          )}

          {/* Mobile — collapse into ⋯ menu */}
          {isMobile && (
            <div style={{ position: "relative" }}>
              {footerMenuOpen && (
                <div onClick={() => setFooterMenuOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 199 }} />
              )}
              <button onClick={() => setFooterMenuOpen(m => !m)}
                style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", padding: "4px 9px", fontSize: 13, color: T.inkLight, lineHeight: 1, fontFamily: "'EB Garamond', serif" }}>
                ···
              </button>
              {footerMenuOpen && (
                <div style={{ position: "absolute", bottom: "calc(100% + 6px)", right: 0, background: T.paper, border: `1px solid ${T.border}`, borderRadius: 2, boxShadow: "0 -4px 16px rgba(26,24,18,0.1)", zIndex: 200, minWidth: 160, overflow: "hidden" }}>
                  {[
                    { label: "Share feedback", href: FEEDBACK_URL, external: true },
                    { label: "Sources", onClick: () => { setFooterMenuOpen(false); navigateTo("sources"); } },
                    { label: "Roadmap", onClick: () => { setFooterMenuOpen(false); navigateTo("roadmap"); } },
                    { label: "About", onClick: () => { setFooterMenuOpen(false); navigateTo("disclaimer"); } },
                    { label: "Privacy", onClick: () => { setFooterMenuOpen(false); navigateTo("privacy"); } },
                  ].map((item, i) => (
                    item.href ? (
                      <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
                        onClick={() => setFooterMenuOpen(false)}
                        style={{ display: "block", padding: "10px 16px", fontSize: 13, fontFamily: "'EB Garamond', serif", color: T.inkMid, textDecoration: "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {item.label}
                      </a>
                    ) : (
                      <button key={i} onClick={item.onClick}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontFamily: "'EB Garamond', serif", color: T.inkMid, background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {item.label}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ── USER PROFILE SHEET ── */}
      {selected === "__user__" && userProfile && sheetOpen && (
        <div style={{ flexShrink: 0, height: isMobile ? "60dvh" : "320px", background: T.paper, borderTop: `1px solid ${T.amber}`, zIndex: 65, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "11px 18px 9px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", gap: 14, flexShrink: 0 }}>
            {/* Amber dot */}
            <div style={{ width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: "50%", background: T.amber, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: isMobile ? 20 : 24, fontFamily: "'Libre Baskerville', serif", color: T.bg, fontWeight: 600 }}>
                {(userProfile.name || userProfile.email || "?").split(" ").map(w => w[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: "0.13em", color: T.amber, marginBottom: 2 }}>
                YOU · {userProfile.country} · {userProfile.born}
              </div>
              <div style={{ fontSize: isMobile ? 16 : 21, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1.1 }}>{userProfile.name}</div>
              <div style={{ fontSize: 10.5, color: T.inkLight, marginTop: 2, letterSpacing: "0.03em" }}>{userProfile.genre}</div>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => { setShowAddSelf(true); setSelfDraft({ ...userProfile }); setAddSelfStep(1); }}
                style={{ fontSize: 8.5, letterSpacing: "0.1em", padding: "4px 8px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid }}>
                EDIT
              </button>
              <button onClick={() => { setSelected(null); setSheetOpen(false); }}
                style={{ background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 19, padding: 0 }}>×</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "11px 18px 16px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 18 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {userProfile.bio && <p style={{ fontSize: 13.5, lineHeight: 1.75, color: T.inkMid, margin: "0 0 11px", fontStyle: "italic" }}>{userProfile.bio}</p>}
              {userProfile.influences?.length > 0 && (
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.blue, marginBottom: 5 }}>INFLUENCED BY</div>
                  {userProfile.influences.map(infId => (
                    <span key={infId} onClick={() => { setSelected(infId); }}
                      style={{ fontSize: 12.5, color: T.blue, cursor: "pointer", borderBottom: `1px solid rgba(74,111,165,0.22)`, paddingBottom: 1, marginRight: 11, display: "inline-block", marginBottom: 3 }}>
                      {PHOTOGRAPHERS[infId]?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ width: isMobile ? "auto" : 180, flexShrink: 0 }}>
              {/* Stats */}
              <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 6 }}>YOUR GRAPH</div>
              <div style={{ fontSize: 11, color: T.inkMid, lineHeight: 1.6, marginBottom: 10 }}>
                <div><span style={{ color: "#4a7fa5" }}>●</span> {Object.values(nodeStates).filter(s => s === "discovered").length} discovered</div>
                <div><span style={{ color: "#4a8a5a" }}>●</span> {Object.values(nodeStates).filter(s => s === "to-explore").length} to explore</div>
              </div>

              {/* You might like */}
              {recommendations.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 7 }}>YOU MIGHT LIKE</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {recommendations.map(id => {
                      const p = PHOTOGRAPHERS[id];
                      const ns = nodeStates[id];
                      return (
                        <div key={id}
                          onClick={() => { setSelected(id); setSheetOpen(true); panToNode(id); }}
                          style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", padding: "4px 0", borderBottom: `1px solid ${T.border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.02)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          {/* State indicator */}
                          <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: ns === "discovered" ? "#4a7fa5" : ns === "to-explore" ? "#4a8a5a" : T.inkFaint }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11.5, fontFamily: "'EB Garamond', serif", color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: 8.5, color: T.inkLight, letterSpacing: "0.04em" }}>{p.genre} · {p.born}</div>
                          </div>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: T.inkFaint, flexShrink: 0 }}>↗</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {userProfile && (
                <button onClick={() => { switchMode("path"); setPathFrom("__user__"); setSelected(null); setSheetOpen(false); }}
                  style={{ marginTop: 4, fontSize: 8.5, letterSpacing: "0.1em", padding: "5px 8px", background: T.amber, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif", width: "100%" }}>
                  TRACE MY PATH →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD YOURSELF MODAL ── */}
      {showAddSelf && (
        <div style={{ position: "absolute", inset: 0, background: T.paper, zIndex: 90, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px 11px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 8.5, letterSpacing: "0.13em", color: T.amber, marginBottom: 2 }}>STEP {addSelfStep} OF 2</div>
              <div style={{ fontSize: isMobile ? 16 : 19, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>
                {addSelfStep === 1 ? "Who are you?" : "Who influenced you?"}
              </div>
            </div>
            <button onClick={() => setShowAddSelf(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 20, padding: 0 }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
            {addSelfStep === 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
                {[
                  { label: "NAME", key: "name", placeholder: "Your full name" },
                  { label: "BIRTH YEAR", key: "born", placeholder: "e.g. 1988" },
                  { label: "COUNTRY OF BIRTH", key: "country", placeholder: "e.g. Germany" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
                    <input
                      value={selfDraft[key] || ""}
                      onChange={e => setSelfDraft(d => ({ ...d, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 15, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>GENRE</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {["Street", "Documentary", "Portrait", "Landscape", "Fashion", "Fine Art", "War", "Conceptual", "Experimental"].map(g => (
                      <button key={g} onClick={() => setSelfDraft(d => ({ ...d, genre: g }))}
                        style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${selfDraft.genre === g ? T.amber : T.border}`, borderRadius: 2, background: selfDraft.genre === g ? T.amber : "transparent", color: selfDraft.genre === g ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif', transition: 'all 0.12s" }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>BIO <span style={{ color: T.inkFaint }}>(optional)</span></div>
                  <textarea
                    value={selfDraft.bio || ""}
                    onChange={e => setSelfDraft(d => ({ ...d, bio: e.target.value }))}
                    placeholder="A few words about your work…"
                    rows={2}
                    style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.ink, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 440 }}>
                <p style={{ fontSize: 13.5, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, marginBottom: 16 }}>
                  Which photographers shaped your vision?
                </p>
                {/* Selected influences */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {(selfDraft.influences || []).map(infId => (
                    <div key={infId} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 10px", border: `1px solid rgba(74,111,165,0.3)`, borderRadius: 2, background: "rgba(74,111,165,0.05)" }}>
                      <span style={{ fontSize: 11.5, color: T.blue, fontFamily: "'EB Garamond', serif" }}>{PHOTOGRAPHERS[infId]?.name}</span>
                      <button onClick={() => setSelfDraft(d => ({ ...d, influences: d.influences.filter(i => i !== infId) }))}
                        style={{ background: "none", border: "none", color: "rgba(74,111,165,0.5)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  {(selfDraft.influences || []).length === 0 && (
                    <span style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic" }}>None added yet — you can always update this later</span>
                  )}
                </div>
                {/* Search */}
                <div style={{ position: "relative" }}>
                  <input
                    autoFocus
                    value={selfInfSearch}
                    onChange={e => setSelfInfSearch(e.target.value)}
                    placeholder="Search photographers…"
                    style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }}
                  />
                  {selfInfSearch.trim().length > 0 && (() => {
                    const cur = new Set(selfDraft.influences || []);
                    const matches = Object.entries(PHOTOGRAPHERS)
                      .filter(([id, p]) => !cur.has(id) && p.name.toLowerCase().includes(selfInfSearch.toLowerCase()))
                      .slice(0, 6);
                    return matches.length > 0 ? (
                      <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: T.paper, border: `1px solid ${T.border}`, boxShadow: "0 6px 20px rgba(26,24,18,0.09)", zIndex: 10, overflow: "hidden" }}>
                        {matches.map(([id, p], i) => (
                          <div key={id}
                            onClick={() => { setSelfDraft(d => ({ ...d, influences: [...(d.influences || []), id] })); setSelfInfSearch(""); }}
                            style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < matches.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 8, alignItems: "baseline" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(74,111,165,0.05)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>{p.name}</span>
                            <span style={{ fontSize: 9, color: T.inkLight }}>{p.born} · {p.style}</span>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
            {addSelfStep === 2 && (
              <button onClick={() => setAddSelfStep(1)}
                style={{ fontSize: 10.5, letterSpacing: "0.08em", padding: "7px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif" }}>
                ← BACK
              </button>
            )}
            {addSelfStep === 1 ? (
              <button
                disabled={!selfDraft.name?.trim() || !selfDraft.born?.trim() || !selfDraft.country?.trim()}
                onClick={() => setAddSelfStep(2)}
                style={{ fontSize: 10.5, letterSpacing: "0.08em", padding: "7px 20px", background: selfDraft.name?.trim() && selfDraft.born?.trim() && selfDraft.country?.trim() ? T.amber : T.inkFaint, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif", transition: "background 0.15s" }}>
                NEXT →
              </button>
            ) : (
              <button onClick={() => {
                setUserProfile({ ...selfDraft, influences: selfDraft.influences || [] });
                setShowAddSelf(false);
                setSelfInfSearch("");
              }}
                style={{ fontSize: 10.5, letterSpacing: "0.08em", padding: "7px 20px", background: T.amber, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
                {userProfile ? "SAVE CHANGES" : "ADD TO GRAPH"}
              </button>
            )}
          </div>
        </div>
      )}

      
    </div>
  );
}

function PathPicker({ value, isActive, placeholder, onClick, isMobile, userProfile }) {
  const label = value === "__user__"
    ? (userProfile?.name || "You")
    : PHOTOGRAPHERS[value]?.name;
  return (
    <button onClick={onClick} style={{
      padding: "4px 9px",
      background: isActive ? "rgba(26,24,18,0.05)" : "transparent",
      border: `1px solid ${isActive ? "rgba(26,24,18,0.28)" : T.border}`,
      borderRadius: 2, cursor: "pointer",
      color: value ? (value === "__user__" ? T.amber : T.ink) : T.inkLight,
      fontSize: isMobile ? 10.5 : 11.5,
      fontFamily: "'EB Garamond', serif",
      letterSpacing: "0.03em",
      minWidth: isMobile ? 95 : 135,
      textAlign: "left", transition: "all 0.15s",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    }}>
      {label || placeholder}
    </button>
  );
}
