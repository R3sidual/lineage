import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
const SHOW_NAMES_AT  = 1.4;  // names appear when zoomed in on a node
const SHOW_YEARS_AT  = 2.2;
const OVERVIEW_SCALE = 0.38; // zoomed out enough to see most of the network
const DETAIL_SCALE   = 1.6;  // zoom level when a node is selected
const PAD = 0.04; // tighter padding so nodes use full width
const DISPUTE_THRESHOLD = 3; // flags needed to trigger review + dashed line

// ─── DATA HOOK ───────────────────────────────────────────────────────────────
// Single source of truth for photographer data.
// Currently returns the hardcoded dataset synchronously.
//
// TO CONNECT A BACKEND: replace the body of this hook with:
//
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   useEffect(() => {
//     fetch('/api/photographers')
//       .then(r => r.json())
//       .then(setData)
//       .catch(setError)
//       .finally(() => setLoading(false));
//   }, []);
//   return { data, loading, error };
//
// The rest of the app reads from `photographers` and never touches
// the PHOTOGRAPHERS constant directly — so this is the only change needed.
//
function usePhotographers() {
  return { data: PHOTOGRAPHERS, loading: false, error: null };
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
function DisclaimerPage({ onEnter, feedbackUrl }) {
  return (
    <div style={{
      width: "100%", height: "100dvh", background: T.bg,
      fontFamily: "'EB Garamond', Georgia, serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: T.ink, padding: "0 28px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

        {/* Wordmark */}
        <div style={{ fontSize: 52, fontFamily: "'Libre Baskerville', serif", fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1, marginBottom: 14 }}>
          Lineage
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 16, fontStyle: "italic", color: T.inkMid, lineHeight: 1.7, marginBottom: 36 }}>
          A map of photographic influence — and your place in it.
        </p>

        {/* Divider */}
        <div style={{ width: 32, height: 1, background: T.inkFaint, margin: "0 auto 32px" }} />

        {/* Note heading */}
        <div style={{ fontSize: 8.5, letterSpacing: "0.14em", color: T.inkLight, marginBottom: 16 }}>
          A NOTE BEFORE YOU BEGIN
        </div>

        {/* Body */}
        <p style={{ fontSize: 14.5, color: T.inkMid, lineHeight: 1.85, marginBottom: 18 }}>
          Lineage is an early prototype. Everything you enter — your name, influences, gear, notes — lives only in your browser. Nothing is sent to any server. Close the tab and it's gone.
        </p>
        <p style={{ fontSize: 14.5, color: T.inkMid, lineHeight: 1.85, marginBottom: 36 }}>
          There is no sign-up for now, so no personal data is collected. The only data we gather is optional feedback via a short survey — which helps us build this into something lasting.
        </p>

        {/* Italic invite */}
        <p style={{ fontSize: 15, fontStyle: "italic", color: T.inkLight, lineHeight: 1.7, marginBottom: 40 }}>
          Explore freely. Add yourself. Tell us what you think.
        </p>

        {/* CTA */}
        <button
          onClick={onEnter}
          style={{
            fontSize: 11, letterSpacing: "0.16em", padding: "12px 36px",
            background: T.ink, border: "none", borderRadius: 2,
            cursor: "pointer", color: T.bg,
            fontFamily: "'EB Garamond', serif",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          ENTER LINEAGE
        </button>

        {/* Footer links */}
        <div style={{ marginTop: 28, display: "flex", gap: 20, justifyContent: "center", alignItems: "center" }}>
          {feedbackUrl && (
            <a href={feedbackUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10.5, letterSpacing: "0.1em", color: T.bg, textDecoration: "none", background: T.amber, padding: "4px 12px", borderRadius: 2 }}>
              SHARE FEEDBACK
            </a>
          )}
          <span style={{ fontSize: 10, color: T.inkFaint, letterSpacing: "0.06em" }}>
            Early prototype · {new Date().getFullYear()}
          </span>
        </div>

      </div>
    </div>
  );
}

function useCurrentUser() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const signup = ({ name, email, password, country, genre, born, bio, influences }) => {
    // Dummy signup — in production this calls supabase.auth.signUp()
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      country,
      genre,
      born,
      bio: bio || "",
      influences: influences || [],
      tier: 3,
      createdAt: new Date().toISOString(),
    };
    persist(newUser);
    return newUser;
  };

  const login = ({ email, password }) => {
    // Dummy login — checks localStorage for a matching email
    // In production this calls supabase.auth.signInWithPassword()
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        if (u.email === email) { persist(u); return { user: u, error: null }; }
      }
      return { user: null, error: "No account found with that email." };
    } catch { return { user: null, error: "Something went wrong." }; }
  };

  const logout = () => persist(null);

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    persist(updated);
    return updated;
  };

  return { user, signup, login, logout, updateUser };
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

// ─── 2D FORCE LAYOUT — CENTRALITY BASED ─────────────────────────────────────
// Nodes are positioned by graph topology, not birth year.
// Highly connected photographers sit near the centre.
// Uses: edge attraction + node repulsion + centre gravity + boundary.
function computeForceLayout(dims, data) {
  const ids = Object.keys(data);
  const W = dims.w * 3.0; // wider virtual canvas — more room as network grows
  const H = dims.h;
  const cx = W / 2, cy = H / 2;

  // Build adjacency — bidirectional
  const adj = {};
  ids.forEach(id => { adj[id] = new Set(); });
  ids.forEach(id => {
    data[id].influences.forEach(inf => {
      if (adj[id]) adj[id].add(inf);
      if (adj[inf]) adj[inf].add(id);
    });
  });

  // Seed: place nodes in a circle with jitter to break symmetry
  const pos = {};
  ids.forEach((id, i) => {
    const angle = (i / ids.length) * 2 * Math.PI;
    const r = Math.min(W, H) * 0.32;
    const jitter = (Math.sin(id.charCodeAt(0) * 17 + id.length * 31) - 0.5) * r * 0.3;
    pos[id] = {
      x: cx + Math.cos(angle) * (r + jitter),
      y: cy + Math.sin(angle) * (r + jitter),
      vx: 0, vy: 0,
    };
  });

  const REPULSION    = Math.min(W, H) * 0.09; // min distance between nodes
  const EDGE_ATTRACT = 0.012;  // how strongly connected nodes pull together
  const GRAVITY      = 0.04;   // pull toward centre — keeps graph compact
  const BOUNDARY_PAD = Math.min(W, H) * 0.06;
  const BOUNDARY_STR = 0.6;
  const DAMPING      = 0.78;
  const ITERATIONS   = 280;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const alpha = 1 - iter / ITERATIONS;

    // Reset forces
    ids.forEach(id => { pos[id].fx = 0; pos[id].fy = 0; });

    // Node–node repulsion
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos[ids[i]], b = pos[ids[j]];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < REPULSION) {
          const f = ((REPULSION - dist) / dist) * alpha * 0.6;
          a.fx -= dx * f; a.fy -= dy * f;
          b.fx += dx * f; b.fy += dy * f;
        }
      }
    }

    // Edge attraction — connected nodes pull toward each other
    ids.forEach(id => {
      adj[id].forEach(nbId => {
        if (!pos[nbId]) return;
        const dx = pos[nbId].x - pos[id].x;
        const dy = pos[nbId].y - pos[id].y;
        pos[id].fx += dx * EDGE_ATTRACT * alpha;
        pos[id].fy += dy * EDGE_ATTRACT * alpha;
      });
    });

    // Centre gravity — pulls all nodes gently toward centre
    // Stronger for less-connected nodes so hubs naturally dominate centre
    ids.forEach(id => {
      const degree = adj[id].size;
      const gravScale = Math.max(0.2, 1 - degree / 12);
      pos[id].fx += (cx - pos[id].x) * GRAVITY * gravScale * alpha;
      pos[id].fy += (cy - pos[id].y) * GRAVITY * gravScale * alpha;
    });

    // Boundary repulsion
    ids.forEach(id => {
      const { x, y } = pos[id];
      if (x < BOUNDARY_PAD)     pos[id].fx += (BOUNDARY_PAD - x) * BOUNDARY_STR;
      if (x > W - BOUNDARY_PAD) pos[id].fx -= (x - (W - BOUNDARY_PAD)) * BOUNDARY_STR;
      if (y < BOUNDARY_PAD)     pos[id].fy += (BOUNDARY_PAD - y) * BOUNDARY_STR;
      if (y > H - BOUNDARY_PAD) pos[id].fy -= (y - (H - BOUNDARY_PAD)) * BOUNDARY_STR;
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

// ─── PORTRAIT IMAGE LOOKUP ───────────────────────────────────────────────────
// Direct Wikimedia Commons thumb.php URLs — no API, no hashing needed
const PORTRAITS = {
  "nadar":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/८/Nadar_self_portrait.jpg/300px-Nadar_self_portrait.jpg",
  "julia-margaret-cameron": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Julia_Margaret_Cameron_%28photograph%29.jpg/300px-Julia_Margaret_Cameron_%28photograph%29.jpg",
  "alfred-stieglitz":       "/portraits/alfred-stieglitz.jpg",
  "eugene-atget":           "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Eugene_Atget%2C_1900.jpg/300px-Eugene_Atget%2C_1900.jpg",
  "edward-steichen":        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Edward_Steichen.jpg/300px-Edward_Steichen.jpg",
  "paul-strand":            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Paul_Strand.jpg/300px-Paul_Strand.jpg",
  "edward-weston":          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Edward_Weston%2C_1946_%28photo_by_Beaumont_Newhall%29.jpg/300px-Edward_Weston%2C_1946_%28photo_by_Beaumont_Newhall%29.jpg",
  "dorothea-lange":         "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Dorothea_Lange_Roy_Stryker_1936.jpg/300px-Dorothea_Lange_Roy_Stryker_1936.jpg",
  "man-ray":                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Man_Ray%2C_1934.jpg/300px-Man_Ray%2C_1934.jpg",
  "ansel-adams":            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ansel_Adams_and_camera.jpg/300px-Ansel_Adams_and_camera.jpg",
  "walker-evans":           "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Walker_Evans_by_Irving_Penn.jpg/300px-Walker_Evans_by_Irving_Penn.jpg",
  "weegee":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Weegee-ICP.jpg/300px-Weegee-ICP.jpg",
  "brassai":                "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Gyula_Hal%C3%A1sz%2C_known_as_Brassai.jpg/300px-Gyula_Hal%C3%A1sz%2C_known_as_Brassai.jpg",
  "robert-capa":            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Robert_Capa_-_Slightly_out_of_Focus_-_cover.jpg/300px-Robert_Capa_-_Slightly_out_of_Focus_-_cover.jpg",
  "henri-cartier-bresson":  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Cartier-Bresson_%281961%29.jpg/300px-Cartier-Bresson_%281961%29.jpg",
  "gordon-parks":           "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Gordon_Parks_photo.jpg/300px-Gordon_Parks_photo.jpg",
  "yousuf-karsh":           "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Yousuf-Karsh.jpg/300px-Yousuf-Karsh.jpg",
  "irving-penn":            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Irving_Penn.jpg/300px-Irving_Penn.jpg",
  "richard-avedon":         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Richard_Avedon_1993.jpg/300px-Richard_Avedon_1993.jpg",
  "helmut-newton":          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Helmut_Newton.jpg/300px-Helmut_Newton.jpg",
  "w-eugene-smith":         "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/W._Eugene_Smith.jpg/300px-W._Eugene_Smith.jpg",
  "diane-arbus":            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Diane_Arbus_%281949%29.jpg/300px-Diane_Arbus_%281949%29.jpg",
  "robert-frank":           "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Robert_Frank_2008.jpg/300px-Robert_Frank_2008.jpg",
  "william-klein":          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/William_Klein_%28photographer%29.jpg/300px-William_Klein_%28photographer%29.jpg",
  "garry-winogrand":        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Garry_Winogrand.jpg/300px-Garry_Winogrand.jpg",
  "lee-friedlander":        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Lee_Friedlander.jpg/300px-Lee_Friedlander.jpg",
  "daido-moriyama":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Daido_Moriyama_2013.jpg/300px-Daido_Moriyama_2013.jpg",
  "william-eggleston":      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/William_Eggleston_2008.jpg/300px-William_Eggleston_2008.jpg",
  "sebastiao-salgado":      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Sebastiao_Salgado_2014.jpg/300px-Sebastiao_Salgado_2014.jpg",
  "nan-goldin":             "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Nan_Goldin.jpg/300px-Nan_Goldin.jpg",
  "cindy-sherman":          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Cindy_Sherman.jpg/300px-Cindy_Sherman.jpg",
  "martin-parr":            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Martin_Parr_%282011%29.jpg/300px-Martin_Parr_%282011%29.jpg",
  "wolfgang-tillmans":      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wolfgang_Tillmans_2012.jpg/300px-Wolfgang_Tillmans_2012.jpg",
  "rinko-kawauchi":         "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Rinko_Kawauchi.jpg/300px-Rinko_Kawauchi.jpg",
  "josef-koudelka":         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Josef_Koudelka.jpg/300px-Josef_Koudelka.jpg",
  "elliott-erwitt":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Elliott_Erwitt.jpg/300px-Elliott_Erwitt.jpg",
  "james-nachtwey":         "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/James_Nachtwey.jpg/300px-James_Nachtwey.jpg",
  "steve-mccurry":          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Steve_McCurry_%282014%29.jpg/300px-Steve_McCurry_%282014%29.jpg",
  "graciela-iturbide":      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Graciela_Iturbide.jpg/300px-Graciela_Iturbide.jpg",
  "zanele-muholi":          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Zanele_Muholi_%282018%29.jpg/300px-Zanele_Muholi_%282018%29.jpg",
  "alec-soth":              "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Alec_Soth.jpg/300px-Alec_Soth.jpg",
  "viviane-sassen":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Viviane_Sassen.jpg/300px-Viviane_Sassen.jpg",
};

// ─── PORTRAIT COMPONENT ──────────────────────────────────────────────────────
// Simple in-memory cache so we don't re-fetch the same photographer twice in a session
const wikiCache = {};

function PhotographerPortrait({ id, name, size = 72 }) {
  const [imgSrc, setImgSrc] = useState(PORTRAITS[id] || null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const initials = name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("");

  // Fetch from Wikipedia API if not in the hardcoded lookup
  useEffect(() => {
    if (PORTRAITS[id]) return;
    if (wikiCache[id]) { setImgSrc(wikiCache[id]); return; }
    if (wikiCache[id] === null) return;

    // Use the search API to find the most relevant page, then get its thumbnail
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name + " photographer")}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&pilimit=1&format=json&origin=*`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const pages = data?.query?.pages;
        if (!pages) return null;
        const page = Object.values(pages)[0];
        return page?.thumbnail?.source || null;
      })
      .then(imgUrl => {
        wikiCache[id] = imgUrl || null;
        if (imgUrl) setImgSrc(imgUrl);
      })
      .catch(() => { wikiCache[id] = null; });
  }, [id, name]);

  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: "rgba(26,24,18,0.05)",
      border: `1px solid rgba(26,24,18,0.08)`,
      overflow: "hidden", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Initials — shown until image loads */}
      {(!loaded || errored || !imgSrc) && (
        <div style={{
          fontSize: size * 0.28, fontFamily: "'Libre Baskerville', serif",
          color: "rgba(26,24,18,0.25)", letterSpacing: "0.05em", userSelect: "none",
        }}>
          {initials}
        </div>
      )}
      {imgSrc && !errored && (
        <img
          src={imgSrc}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); wikiCache[id] = null; }}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            filter: "grayscale(100%) contrast(1.05)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.35s",
          }}
        />
      )}
    </div>
  );
}

// Suggested "Talk to Me About" topics — user can pick or add their own
const TALK_TOPICS = [
  "Analogue", "Film Photography", "Darkroom", "Medium Format", "Large Format",
  "Street", "Documentary", "Portrait", "Landscape", "Fashion", "Fine Art",
  "Photobook", "Exhibitions", "Lightroom", "Capture One", "Gear", "Business",
  "Printing", "Zines", "Archive", "Collaboration",
];

const GEAR_CATEGORIES = [
  "Camera Body", "Lens", "Film", "Light Meter", "Tripod",
  "Bag", "Scanner", "Darkroom", "Software", "Accessory", "Other",
];

// ─── GEAR PAGE ────────────────────────────────────────────────────────────────
// ─── DISCOVER PAGE ────────────────────────────────────────────────────────────
// ─── SOURCES PAGE ─────────────────────────────────────────────────────────────
// Public page listing all connections with citations where available.
// Sources marked "pending" are well-established in photography history
// but not yet formally cited — contributions welcome.

const CONNECTION_SOURCES = {
  "alfred-stieglitz--nadar":                  { text: "Stieglitz acknowledged Nadar's portrait work as foundational; Stieglitz, 'Camera Notes', 1897–1903", url: "https://www.metmuseum.org/essays/alfred-stieglitz-291-and-the-photo-secession", status: "confirmed" },
  "edward-steichen--alfred-stieglitz":        { text: "Stieglitz mentored Steichen from 1900; co-founded Photo-Secession together, 1902", url: "https://www.moma.org/artists/5632", status: "confirmed" },
  "paul-strand--alfred-stieglitz":            { text: "Stieglitz published Strand in Camera Work, 1916–17; described him as 'the only photographer'", url: "https://www.metmuseum.org/art/collection/search/267214", status: "confirmed" },
  "edward-weston--alfred-stieglitz":          { text: "Weston visited Stieglitz's 291 gallery, 1922; correspondence archived at Yale", url: "https://www.edward-weston.com", status: "confirmed" },
  "edward-weston--paul-strand":               { text: "Weston, 'Daybooks', 1923 — credits Strand's straight photography approach", status: "confirmed" },
  "berenice-abbott--eugene-atget":            { text: "Abbott met Atget in Paris, 1925; preserved and published his archive posthumously", url: "https://www.moma.org/artists/229", status: "confirmed" },
  "man-ray--alfred-stieglitz":               { text: "Man Ray exhibited at 291 gallery, 1915; Stieglitz championed his early work", url: "https://www.manray.net", status: "confirmed" },
  "ansel-adams--alfred-stieglitz":            { text: "Adams visited Stieglitz at An American Place, 1933; Stieglitz gave Adams his first New York show", url: "https://anseladams.com", status: "confirmed" },
  "ansel-adams--paul-strand":                { text: "Adams, 'Examples: The Making of 40 Photographs', 1983", status: "confirmed" },
  "walker-evans--eugene-atget":              { text: "Evans, interview with Leslie Katz, 'Art in America', 1971", url: "https://www.moma.org/artists/1777", status: "confirmed" },
  "henri-cartier-bresson--eugene-atget":     { text: "HCB, 'The Mind's Eye', 1999 — cites Atget's documentary method", url: "https://www.magnumphotos.com/photographer/henri-cartier-bresson/", status: "confirmed" },
  "henri-cartier-bresson--paul-strand":      { text: "HCB met Strand in New York, 1935; acknowledged decisive influence", url: "https://www.magnumphotos.com/photographer/henri-cartier-bresson/", status: "confirmed" },
  "diane-arbus--lisette-model":              { text: "Arbus studied under Model at the New School, 1957–58", url: "https://www.metmuseum.org/art/collection/search#!?q=diane+arbus", status: "confirmed" },
  "diane-arbus--weegee":                     { text: "Arbus cited Weegee's unflinching gaze; both worked New York streets", status: "confirmed" },
  "robert-frank--henri-cartier-bresson":     { text: "Frank, interview in 'Photography Speaks', 2004", url: "https://www.moma.org/artists/1973", status: "confirmed" },
  "gordon-parks--dorothea-lange":            { text: "Parks, 'A Choice of Weapons', 1966 — credits Lange's FSA work", url: "https://www.gordonparksfoundation.org", status: "confirmed" },
  "gordon-parks--walker-evans":             { text: "Parks studied Evans's FSA photographs at the Library of Congress, 1942", url: "https://www.gordonparksfoundation.org", status: "confirmed" },
  "sebastiao-salgado--henri-cartier-bresson": { text: "Salgado joined Magnum Photos, 1979; HCB was a founding member and direct influence", url: "https://www.amazonasimages.com", status: "confirmed" },
  "daido-moriyama--william-klein":           { text: "Moriyama, 'Daido by Daido', 2012 — credits Klein's raw urban approach", url: "https://www.daido.co.jp", status: "confirmed" },
  "william-eggleston--henri-cartier-bresson": { text: "Eggleston cited HCB as a primary influence on his compositional approach", url: "https://www.egglestontrust.com", status: "confirmed" },
  "nan-goldin--diane-arbus":                 { text: "Goldin, 'The Ballad of Sexual Dependency', 1986 — Arbus's intimate portraiture as precedent", status: "confirmed" },
  "cindy-sherman--diane-arbus":              { text: "Sherman cited Arbus's self-conscious staging of identity", url: "https://www.moma.org/artists/5392", status: "confirmed" },
  "wolfgang-tillmans--martin-parr":         { text: "Tillmans acknowledged Parr's vernacular colour documentary approach", url: "https://www.tillmans.co.uk", status: "confirmed" },
  "rinko-kawauchi--daido-moriyama":          { text: "Kawauchi cited Moriyama's fragmented visual language in interviews", status: "confirmed" },
  "josef-koudelka--henri-cartier-bresson":   { text: "Koudelka joined Magnum, 1971; HCB nominated him", url: "https://www.magnumphotos.com/photographer/josef-koudelka/", status: "confirmed" },
  "james-nachtwey--w-eugene-smith":         { text: "Nachtwey, 'War Photographer' documentary, 2001 — Smith as primary influence", url: "https://jamesnachtwey.com", status: "confirmed" },
  "james-nachtwey--robert-capa":            { text: "Nachtwey cited Capa's commitment to bearing witness", url: "https://jamesnachtwey.com", status: "confirmed" },
  "martin-parr--william-eggleston":         { text: "Parr acknowledged Eggleston's colour vernacular as transformative", url: "https://www.martinparr.com", status: "confirmed" },
  "lee-miller--man-ray":                    { text: "Miller and Man Ray collaborated in Paris, 1929–32; she co-discovered the solarisation technique", url: "https://www.leemiller.co.uk", status: "confirmed" },
  "graciela-iturbide--manuel-alvarez-bravo": { text: "Iturbide studied under Álvarez Bravo at CUEC, Mexico City, 1969", url: "https://www.gracielaiturbide.org", status: "confirmed" },
};

function SourcesPage({ onBack, PHOTOGRAPHERS }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("photographer"); // "photographer" | "status"

  // Build full connections list
  const connections = [];
  Object.entries(PHOTOGRAPHERS).forEach(([id, p]) => {
    (p.influences || []).forEach(infId => {
      const inf = PHOTOGRAPHERS[infId];
      if (!inf) return;
      const key1 = `${id}--${infId}`;
      const key2 = `${infId}--${id}`;
      const rawSource = CONNECTION_SOURCES[key1] || CONNECTION_SOURCES[key2] || null;
      const source = rawSource ? { ...rawSource } : { status: "pending" };
      connections.push({
        photographer: p.name,
        influencedBy: inf.name,
        photographerId: id,
        influencedById: infId,
        source,
        born: p.born,
      });
    });
  });

  // Sort and filter
  const filtered = connections
    .filter(c => !search.trim() ||
      c.photographer.toLowerCase().includes(search.toLowerCase()) ||
      c.influencedBy.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "status") {
        const order = { confirmed: 0, submitted: 1, pending: 2 };
        const aO = order[a.source?.status] ?? 2;
        const bO = order[b.source?.status] ?? 2;
        if (aO !== bO) return aO - bO;
      }
      return a.photographer.localeCompare(b.photographer);
    });

  const confirmed = connections.filter(c => c.source?.status === "confirmed").length;
  const submitted = connections.filter(c => c.source?.status === "submitted").length;
  const linkedSources = connections.filter(c => c.source?.url).length;

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ padding: "13px 22px 11px", borderBottom: `1px solid ${T.border}`, background: T.paper, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMid, fontSize: 13, fontFamily: "'EB Garamond', serif", padding: 0, marginRight: 18 }}>
              ← Back
            </button>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>Sources</div>
            <div style={{ fontSize: 9, letterSpacing: "0.1em", color: T.inkLight, marginTop: 3 }}>
              {confirmed} confirmed · {submitted > 0 ? `${submitted} submitted · ` : ""}{connections.length - confirmed - submitted} pending · {connections.length} total
            </div>
          </div>
        </div>
        {/* Search + sort */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by photographer…"
            style={{ flex: 1, border: "none", borderBottom: `1px solid ${T.border}`, padding: "5px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none" }}
          />
          <button onClick={() => setSortBy(s => s === "photographer" ? "status" : "photographer")}
            style={{ fontSize: 9, letterSpacing: "0.08em", padding: "4px 8px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif", whiteSpace: "nowrap" }}>
            {sortBy === "photographer" ? "SORT: A–Z" : "SORT: CITED FIRST"}
          </button>
        </div>
      </header>

      {/* Note */}
      <div style={{ padding: "10px 22px", background: "rgba(160,96,32,0.05)", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.6, fontStyle: "italic" }}>
          All connections reflect documented influences in photography history. Sources marked "pending" are well-established in the literature but not yet formally cited. If you can help verify or correct a connection, <a href="mailto:lineage-prjct@gmail.com?subject=Connection%20correction" style={{ color: T.amber, textDecoration: "none", borderBottom: `1px solid rgba(160,96,32,0.3)` }}>please let us know</a>.
        </p>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: 0, padding: "8px 22px", borderBottom: `1px solid ${T.border}`, background: T.paper, position: "sticky", top: 0, zIndex: 10 }}>
          {["PHOTOGRAPHER", "INFLUENCED BY", "SOURCE", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 7.5, letterSpacing: "0.12em", color: T.inkLight }}>{h}</div>
          ))}
        </div>

        {filtered.map((c, i) => (
          <div key={`${c.photographerId}-${c.influencedById}`}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: 0, padding: "10px 22px", borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? "transparent" : "rgba(26,24,18,0.015)" }}>
            <div style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", paddingRight: 12 }}>{c.photographer}</div>
            <div style={{ fontSize: 13, color: T.blue, paddingRight: 12 }}>{c.influencedBy}</div>
            <div style={{ fontSize: 11.5, color: c.source.status === "confirmed" ? T.inkMid : c.source.status === "submitted" ? T.amber : T.inkFaint, fontStyle: c.source.status === "pending" ? "italic" : "normal", paddingRight: 12, lineHeight: 1.5 }}>
              {c.source.status === "pending" ? "Source pending" : (
                <>
                  {c.source.text}
                  {c.source.url && (
                    <a href={c.source.url} target="_blank" rel="noopener noreferrer"
                      style={{ marginLeft: 6, fontSize: 10, color: T.amber, textDecoration: "none", borderBottom: `1px solid rgba(160,96,32,0.3)` }}>
                      ↗ view
                    </a>
                  )}
                </>
              )}
            </div>
            <div>
              {c.source.status === "confirmed"
                ? <span style={{ fontSize: 8, letterSpacing: "0.06em", color: "#4a8a5a", border: "1px solid rgba(74,138,90,0.3)", padding: "2px 5px", borderRadius: 2, whiteSpace: "nowrap" }}>CONFIRMED</span>
                : c.source.status === "submitted"
                ? <span style={{ fontSize: 8, letterSpacing: "0.06em", color: T.amber, border: `1px solid rgba(160,96,32,0.3)`, padding: "2px 5px", borderRadius: 2, whiteSpace: "nowrap" }}>SUBMITTED</span>
                : <button onClick={() => {
                    const subject = encodeURIComponent(`Source submission: ${c.photographer} ← ${c.influencedBy}`);
                    const body = encodeURIComponent(`I can provide a source for the connection between ${c.photographer} and ${c.influencedBy}.\n\nCitation:\n\nURL (optional):\n`);
                    window.open(`mailto:lineage-prjct@gmail.com?subject=${subject}&body=${body}`);
                  }}
                  style={{ fontSize: 8, letterSpacing: "0.06em", color: T.inkFaint, border: `1px solid ${T.border}`, padding: "2px 5px", borderRadius: 2, background: "none", cursor: "pointer", fontFamily: "'EB Garamond', serif", whiteSpace: "nowrap" }}>
                  + SOURCE
                </button>
              }
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: "40px 22px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: T.inkFaint, fontStyle: "italic" }}>No connections matching "{search}"</p>
          </div>
        )}

        <div style={{ padding: "20px 22px", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic", lineHeight: 1.6 }}>
            {connections.length} documented connections between {Object.keys(PHOTOGRAPHERS).length} photographers. This list is open to correction and contribution.
          </p>
        </div>
      </div>
    </div>
  );
}

function DiscoverPage({ user, onBack, onViewInGraph, nodeStates, setNodeStates, updateUser, PHOTOGRAPHERS }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [activeTab, setActiveTab]     = useState(0); // degree level shown

  // Build degrees from user's influences outward
  const degrees = useMemo(() => {
    // Combine user.influences with any nodes currently marked as "influenced"
    // so tabs update immediately when marking someone without waiting for updateUser
    const nodeInfluences = Object.entries(nodeStates)
      .filter(([, s]) => s === "influenced")
      .map(([id]) => id);
    const allInfluences = [...new Set([...(user?.influences || []), ...nodeInfluences])];

    if (!allInfluences.length) return [];
    const seen = new Set(["__user__"]);
    const levels = [];

    // Degree 1 — user's direct influences
    const d1 = allInfluences.filter(id => PHOTOGRAPHERS[id]);
    d1.forEach(id => seen.add(id));
    levels.push(d1);

    // Degrees 2–4
    for (let i = 0; i < 3; i++) {
      const prev = levels[levels.length - 1];
      const next = [];
      prev.forEach(id => {
        const p = PHOTOGRAPHERS[id];
        if (!p) return;
        p.influences.forEach(infId => {
          if (!seen.has(infId) && PHOTOGRAPHERS[infId]) {
            seen.add(infId);
            next.push(infId);
          }
        });
      });
      if (next.length === 0) break;
      levels.push(next);
    }
    return levels;
  }, [user, nodeStates, PHOTOGRAPHERS]);

  const totalNew = degrees.flat().filter(id => !nodeStates[id]).length;

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const cycleState = (id) => {
    setNodeStates(prev => {
      const cur = prev[id] || null;
      const next = cur === null ? "to-explore"
        : cur === "to-explore" ? "discovered"
        : cur === "discovered" ? "influenced"
        : null;
      const n = { ...prev };
      if (next === null) delete n[id]; else n[id] = next;
      // Sync influences to user profile
      const currentInfluences = user?.influences || [];
      if (next === "influenced" && !currentInfluences.includes(id)) {
        updateUser({ influences: [...currentInfluences, id] });
      } else if (next === null && cur === "influenced") {
        updateUser({ influences: currentInfluences.filter(i => i !== id) });
      }
      return n;
    });
  };

  const stateColor  = { "to-explore": "#4a8a5a", "discovered": "#4a7fa5", "influenced": T.amber };
  const stateLabel  = { "to-explore": "To Explore", "discovered": "Discovered", "influenced": "Influenced by" };
  const stateSymbol = { "to-explore": "◎", "discovered": "✓", "influenced": "★" };

  const degreeLabels = ["Your influences", "Their influences", "One step further", "Going deeper"];

  const PhotographerCard = ({ id, depth }) => {
    const p = PHOTOGRAPHERS[id];
    if (!p) return null;
    const state     = nodeStates[id] || null;
    const expanded  = expandedIds.has(id);
    const subInfluences = (p.influences || []).filter(i => PHOTOGRAPHERS[i]);

    return (
      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", paddingLeft: depth * 16 }}>
          {/* Portrait */}
          <PhotographerPortrait id={id} name={p.name} size={40} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: T.ink, lineHeight: 1.2 }}>{p.name}</div>
            <div style={{ fontSize: 10.5, color: T.inkLight, marginTop: 2 }}>{p.genre} · {p.born}</div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            {/* State toggle */}
            <button onClick={() => cycleState(id)}
              style={{
                fontSize: 9.5, letterSpacing: "0.06em", padding: "3px 8px",
                border: `1px solid ${state ? stateColor[state] : T.border}`,
                borderRadius: 2, background: state ? stateColor[state] : "transparent",
                color: state ? T.bg : T.inkLight,
                cursor: "pointer", fontFamily: "'EB Garamond', serif",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}>
              {state ? `${stateSymbol[state]} ${stateLabel[state]}` : "+ Mark"}
            </button>
            {/* View in graph */}
            <button onClick={() => onViewInGraph(id)}
              title="View in graph"
              style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 13, padding: "2px 4px", lineHeight: 1 }}>
              ↗
            </button>
            {/* Expand influences */}
            {subInfluences.length > 0 && (
              <button onClick={() => toggleExpand(id)}
                style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 11, padding: "2px 4px", lineHeight: 1, transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "none" }}>
                ›
              </button>
            )}
          </div>
        </div>

        {/* Expanded influences */}
        {expanded && subInfluences.map(infId => (
          <PhotographerCard key={infId} id={infId} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ padding: "13px 22px 11px", borderBottom: `1px solid ${T.border}`, background: T.paper, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <button onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMid, fontSize: 13, fontFamily: "'EB Garamond', serif", padding: 0 }}>
            ← Profile
          </button>
          <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", marginLeft: 18 }}>Discover</div>
          {totalNew > 0 && (
            <div style={{ marginLeft: 10, fontSize: 9, letterSpacing: "0.08em", color: T.inkLight, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "2px 7px" }}>
              {totalNew} unseen
            </div>
          )}
        </div>

        {/* Degree tabs */}
        {degrees.length > 0 && (
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}`, marginTop: 4 }}>
            {degrees.map((deg, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                style={{
                  padding: "7px 14px", background: "transparent", border: "none",
                  borderBottom: activeTab === i ? `2px solid ${T.ink}` : "2px solid transparent",
                  cursor: "pointer", fontSize: 10, letterSpacing: "0.08em",
                  color: activeTab === i ? T.ink : T.inkLight,
                  fontFamily: "'EB Garamond', serif",
                  transition: "color 0.15s",
                }}>
                {degreeLabels[i]}
                <span style={{ marginLeft: 5, fontSize: 8.5, color: T.inkFaint }}>({deg.length})</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>

          {/* Empty state */}
          {!degrees.length && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 15, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7, maxWidth: 340, margin: "0 auto 24px" }}>
                Add some influences to your profile to start discovering photographers through your lineage.
              </p>
              <button onClick={onBack}
                style={{ fontSize: 10.5, letterSpacing: "0.1em", padding: "8px 20px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
                ← GO TO PROFILE
              </button>
            </div>
          )}

          {/* Degree list */}
          {degrees.length > 0 && degrees[activeTab] && (
            <>
              <div style={{ padding: "14px 0 4px" }}>
                <p style={{ fontSize: 12, color: T.inkLight, fontStyle: "italic", lineHeight: 1.6 }}>
                  { activeTab === 0 && "Photographers you've listed as influences." }
                  { activeTab === 1 && "Who influenced the photographers who influenced you." }
                  { activeTab === 2 && "One step further back through the lineage." }
                  { activeTab === 3 && "Deep in the roots of your photographic tree." }
                </p>
              </div>
              {degrees[activeTab].map(id => (
                <PhotographerCard key={id} id={id} depth={0} />
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function GearPage({ user, onBack, updateUser }) {
  const [adding, setAdding]   = useState(false);
  const [draft, setDraft]     = useState({ category: "Camera Body", name: "", link: "", note: "" });
  const [editingId, setEditingId] = useState(null);

  const gear = user.gear || [];

  // Group by category
  const grouped = GEAR_CATEGORIES.reduce((acc, cat) => {
    const items = gear.filter(g => g.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const saveItem = () => {
    if (!draft.name.trim()) return;
    if (editingId) {
      updateUser({ gear: gear.map(g => g.id === editingId ? { ...draft, id: editingId } : g) });
      setEditingId(null);
    } else {
      updateUser({ gear: [...gear, { ...draft, id: Date.now() }] });
    }
    setDraft({ category: "Camera Body", name: "", link: "", note: "" });
    setAdding(false);
  };

  const removeItem = (id) => updateUser({ gear: gear.filter(g => g.id !== id) });

  const startEdit = (item) => {
    setDraft({ ...item });
    setEditingId(item.id);
    setAdding(true);
  };

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", color: T.ink, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ padding: "13px 22px 11px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", background: T.paper, flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMid, fontSize: 13, fontFamily: "'EB Garamond', serif", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          ← Profile
        </button>
        <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", marginLeft: 18 }}>My Gear</div>
        <button onClick={() => { setAdding(true); setEditingId(null); setDraft({ category: "Camera Body", name: "", link: "", note: "" }); }}
          style={{ marginLeft: "auto", fontSize: 10.5, letterSpacing: "0.1em", padding: "5px 14px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
          + ADD GEAR
        </button>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "28px 22px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>

          {gear.length === 0 && !adding && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 16, color: T.inkFaint }}>⌂</div>
              <p style={{ fontSize: 15, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7, maxWidth: 360, margin: "0 auto 24px" }}>
                Share the gear you shoot with. Cameras, lenses, film, bags — whatever defines your kit.
              </p>
              <button onClick={() => setAdding(true)}
                style={{ fontSize: 10.5, letterSpacing: "0.1em", padding: "8px 20px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
                ADD YOUR FIRST ITEM
              </button>
            </div>
          )}

          {/* Gear grouped by category */}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.13em", color: T.inkLight, marginBottom: 12 }}>{category.toUpperCase()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 15, fontFamily: "'Libre Baskerville', serif", color: T.ink, textDecoration: "none", borderBottom: `1px solid ${T.border}` }}>
                            {item.name}
                          </a>
                        ) : (
                          <span style={{ fontSize: 15, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>{item.name}</span>
                        )}
                        {item.link && (
                          <span style={{ fontSize: 9, color: T.inkFaint, letterSpacing: "0.06em" }}>↗ LINK</span>
                        )}
                      </div>
                      {item.note && (
                        <p style={{ fontSize: 12.5, color: T.inkLight, fontStyle: "italic", margin: "4px 0 0", lineHeight: 1.5 }}>{item.note}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => startEdit(item)}
                        style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 11, fontFamily: "'EB Garamond', serif", letterSpacing: "0.06em", padding: 0 }}>
                        EDIT
                      </button>
                      <button onClick={() => removeItem(item.id)}
                        style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 15, padding: 0, lineHeight: 1 }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Affiliate note */}
          {gear.length > 0 && (
            <p style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic", lineHeight: 1.6, marginTop: 8 }}>
              Links will become affiliate links — you'll earn a commission when other photographers buy gear you recommend.
            </p>
          )}
        </div>
      </div>

      {/* Add / Edit form — slides up from bottom */}
      {adding && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(245,242,236,0.6)", backdropFilter: "blur(4px)", zIndex: 80, display: "flex", alignItems: "flex-end" }}
          onClick={e => { if (e.target === e.currentTarget) { setAdding(false); setEditingId(null); } }}>
          <div style={{ width: "100%", background: T.paper, borderTop: `1px solid ${T.border}`, padding: "22px 22px 32px", maxHeight: "85dvh", overflowY: "auto" }}>
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>
                  {editingId ? "Edit Item" : "Add Gear"}
                </div>
                <button onClick={() => { setAdding(false); setEditingId(null); }}
                  style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.inkLight, padding: 0 }}>×</button>
              </div>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 8 }}>CATEGORY</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {GEAR_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setDraft(d => ({ ...d, category: cat }))}
                      style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${draft.category === cat ? T.ink : T.border}`, borderRadius: 2, background: draft.category === cat ? T.ink : "transparent", color: draft.category === cat ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif", transition: "all 0.12s" }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>NAME</div>
                <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Leica M6, Kodak Portra 400, Peak Design Everyday Bag…"
                  style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Link */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>LINK <span style={{ color: T.inkFaint }}>(optional — becomes affiliate link)</span></div>
                <input value={draft.link} onChange={e => setDraft(d => ({ ...d, link: e.target.value }))}
                  placeholder="https://…"
                  style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Note */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>NOTE <span style={{ color: T.inkFaint }}>(optional)</span></div>
                <input value={draft.note} onChange={e => setDraft(d => ({ ...d, note: e.target.value }))}
                  placeholder="Why you love it, how you use it…"
                  style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAdding(false); setEditingId(null); }}
                  style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontSize: 10.5, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
                  CANCEL
                </button>
                <button onClick={saveItem}
                  style={{ flex: 1, padding: "8px", background: draft.name.trim() ? T.ink : T.inkFaint, border: "none", borderRadius: 2, cursor: draft.name.trim() ? "pointer" : "default", color: T.bg, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif", transition: "background 0.15s" }}>
                  {editingId ? "SAVE CHANGES" : "ADD TO GEAR"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePage({ user, onExplore, onLogout, updateUser, nodeStates, setNodeStates, PHOTOGRAPHERS }) {
  const [editing, setEditing]         = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [showGear, setShowGear]       = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [draft, setDraft]             = useState({ ...user });
  const [infSearch, setInfSearch] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [lighthouseDraft, setLighthouseDraft] = useState({ url: "", caption: "" });

  const discovered = Object.values(nodeStates).filter(s => s === "discovered").length;
  const toExplore  = Object.values(nodeStates).filter(s => s === "to-explore").length;
  const tierLabel  = { 1: "Tier 1 — Canonical", 2: "Tier 2 — Verified", 3: "Tier 3 — Member" };
  const tierColor  = { 1: T.amber, 2: T.blue, 3: T.inkLight };

  const openEdit = (section) => { setDraft({ ...user }); setEditSection(section); setEditing(true); };
  const saveEdit = () => { updateUser(draft); setEditing(false); setEditSection(null); };

  const addTopic = (topic) => {
    const cur = new Set(draft.talkTopics || []);
    if (!cur.has(topic)) setDraft(d => ({ ...d, talkTopics: [...(d.talkTopics || []), topic] }));
  };
  const removeTopic = (topic) => setDraft(d => ({ ...d, talkTopics: (d.talkTopics || []).filter(t => t !== topic) }));

  const addLighthouse = () => {
    if (!lighthouseDraft.url.trim()) return;
    setDraft(d => ({ ...d, lighthouseWorks: [...(d.lighthouseWorks || []), { ...lighthouseDraft, id: Date.now() }] }));
    setLighthouseDraft({ url: "", caption: "" });
  };
  const removeLighthouse = (id) => setDraft(d => ({ ...d, lighthouseWorks: (d.lighthouseWorks || []).filter(w => w.id !== id) }));

  // Section component for consistent styling
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

      {/* Gear page — slides over profile */}
      {showGear && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100 }}>
          <GearPage user={user} onBack={() => setShowGear(false)} updateUser={updateUser} />
        </div>
      )}

      {/* Discover page — slides over profile */}
      {showDiscover && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100 }}>
          <DiscoverPage
            user={user}
            onBack={() => setShowDiscover(false)}
            onViewInGraph={(id) => { setShowDiscover(false); onExplore(); }}
            nodeStates={nodeStates}
            setNodeStates={setNodeStates}
            updateUser={updateUser}
            PHOTOGRAPHERS={PHOTOGRAPHERS}
          />
        </div>
      )}
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ padding: "13px 22px 11px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", background: T.paper, flexShrink: 0 }}>
        <div style={{ fontSize: 19, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>Lineage</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 9, letterSpacing: "0.1em", padding: "5px 10px", background: T.amber, color: T.bg, textDecoration: "none", borderRadius: 2, whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
            SHARE FEEDBACK
          </a>
          <button onClick={onExplore}
            style={{ fontSize: 10.5, letterSpacing: "0.1em", padding: "5px 14px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
            EXPLORE NETWORK →
          </button>
          <button onClick={onLogout}
            style={{ fontSize: 10.5, letterSpacing: "0.08em", padding: "5px 10px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkLight, fontFamily: "'EB Garamond', serif" }}>
            SIGN OUT
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "28px 22px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* ── PROFILE HEADER ── */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.amber, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 24, fontFamily: "'Libre Baskerville', serif", color: T.bg, fontWeight: 600 }}>
                {user.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: "0.12em", color: tierColor[user.tier], marginBottom: 4 }}>
                {tierLabel[user.tier]}
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1.1, marginBottom: 4 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 12, color: T.inkLight, letterSpacing: "0.04em" }}>
                {[user.genre, user.country, user.born].filter(Boolean).join(" · ")}
              </div>
              {user.bio && (
                <p style={{ fontSize: 14, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, margin: "10px 0 0" }}>{user.bio}</p>
              )}
            </div>
            <button onClick={() => openEdit("basic")}
              style={{ fontSize: 9, letterSpacing: "0.1em", padding: "4px 10px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif", flexShrink: 0 }}>
              EDIT
            </button>
          </div>

          {/* ── STATS ── */}
          <div style={{ display: "flex", gap: 28, marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${T.border}`, alignItems: "flex-end", flexWrap: "wrap" }}>
            {[
              { label: "INFLUENCES", value: user.influences?.length || 0 },
              { label: "DISCOVERED", value: discovered, color: "#4a7fa5" },
              { label: "TO EXPLORE", value: toExplore, color: "#4a8a5a" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontSize: 26, fontFamily: "'Libre Baskerville', serif", color: color || T.ink }}>{value}</div>
                <div style={{ fontSize: 8, letterSpacing: "0.1em", color: T.inkLight, marginTop: 2 }}>{label}</div>
              </div>
            ))}
            <button onClick={() => setShowDiscover(true)}
              style={{ marginLeft: "auto", fontSize: 10, letterSpacing: "0.1em", padding: "6px 14px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontFamily: "'EB Garamond', serif" }}>
              DISCOVER →
            </button>
          </div>

          {/* ── MY PHOTOGRAPHY ── */}
          <Section title="MY PHOTOGRAPHY" onEdit={() => openEdit("photography")}
            empty={!user.myPhotography} emptyText="Share what your photography is about — your approach, what drives you, what you're working on.">
            <p style={{ fontSize: 15, lineHeight: 1.85, color: T.inkMid }}>{user.myPhotography}</p>
          </Section>

          {/* ── LIGHTHOUSE WORKS ── */}
          <Section title="LIGHTHOUSE WORKS" onEdit={() => openEdit("lighthouse")}
            empty={!user.lighthouseWorks?.length} emptyText="Add 3–5 images that best represent your work. The photographs that define you.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {(user.lighthouseWorks || []).map(work => (
                <div key={work.id} style={{ position: "relative" }}>
                  <div style={{ paddingTop: "75%", position: "relative", background: "rgba(26,24,18,0.04)", overflow: "hidden", borderRadius: 2 }}>
                    <img src={work.url} alt={work.caption || ""}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.style.display = "none"; }} />
                  </div>
                  {work.caption && (
                    <p style={{ fontSize: 11, color: T.inkLight, marginTop: 5, fontStyle: "italic", lineHeight: 1.4 }}>{work.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ── TALK TO ME ABOUT ── */}
          <Section title="TALK TO ME ABOUT" onEdit={() => openEdit("topics")}
            empty={!user.talkTopics?.length} emptyText="Add topics you're interested in discussing with other photographers.">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(user.talkTopics || []).map(topic => (
                <div key={topic} style={{ fontSize: 12, color: T.inkMid, padding: "5px 12px", border: `1px solid ${T.border}`, borderRadius: 20, background: T.paper }}>
                  {topic}
                </div>
              ))}
            </div>
          </Section>

          {/* ── INFLUENCED BY ── */}
          <Section title="INFLUENCED BY" onEdit={() => openEdit("influences")}
            empty={!user.influences?.length} emptyText="Which photographers shaped your vision?">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(user.influences || []).map(id => {
                const ns = nodeStates[id] || null;
                const stateColour = ns === "influenced" ? T.amber : ns === "discovered" ? "#4a7fa5" : ns === "to-explore" ? "#4a8a5a" : null;
                const stateSymbol = ns === "influenced" ? "★" : ns === "discovered" ? "✓" : ns === "to-explore" ? "◎" : null;
                return (
                  <div key={id}
                    onClick={() => {
                      setNodeStates(prev => {
                        const cur = prev[id] || null;
                        const next = cur === null ? "to-explore" : cur === "to-explore" ? "discovered" : cur === "discovered" ? "influenced" : null;
                        const n = { ...prev };
                        if (next === null) delete n[id]; else n[id] = next;
                        return n;
                      });
                    }}
                    style={{
                      fontSize: 13, padding: "4px 10px", borderRadius: 2, cursor: "pointer",
                      border: `1px solid ${stateColour ? stateColour : "rgba(74,111,165,0.25)"}`,
                      color: stateColour || T.blue,
                      background: stateColour ? `${stateColour}12` : "transparent",
                      display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.15s",
                    }}>
                    {stateSymbol && <span style={{ fontSize: 10 }}>{stateSymbol}</span>}
                    {PHOTOGRAPHERS[id]?.name}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* ── LINKS ── */}
          <Section title="LINKS" onEdit={() => openEdit("links")}
            empty={!user.website && !user.instagram && !user.twitter}
            emptyText="Add your website, Instagram, or other links.">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { key: "website", label: "Website" },
                { key: "instagram", label: "Instagram" },
                { key: "twitter", label: "Twitter / X" },
              ].filter(({ key }) => user[key]).map(({ key, label }) => (
                <a key={key} href={user[key].startsWith("http") ? user[key] : `https://${user[key]}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12.5, color: T.inkMid, padding: "4px 10px", border: `1px solid ${T.border}`, borderRadius: 2, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  {label} <span style={{ fontSize: 10, color: T.inkFaint }}>↗</span>
                </a>
              ))}
            </div>
          </Section>

          {/* ── MY GEAR ── */}
          <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.13em", color: T.inkLight }}>MY GEAR</div>
              <button onClick={() => setShowGear(true)}
                style={{ marginLeft: "auto", fontSize: 8.5, letterSpacing: "0.08em", padding: "3px 8px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkLight, fontFamily: "'EB Garamond', serif" }}>
                {(user.gear || []).length === 0 ? "+ ADD" : "VIEW ALL"}
              </button>
            </div>
            {(user.gear || []).length === 0 ? (
              <p style={{ fontSize: 13, color: T.inkFaint, fontStyle: "italic" }}>
                Share the cameras, lenses, film and gear you shoot with.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Show first 4 items as preview */}
                {(user.gear || []).slice(0, 4).map((item, i) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "8px 0", borderBottom: i < Math.min(3, (user.gear||[]).length-1) ? `1px solid ${T.border}` : "none" }}>
                    <span style={{ fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint, width: 90, flexShrink: 0 }}>{item.category.toUpperCase()}</span>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13.5, color: T.ink, textDecoration: "none", borderBottom: `1px solid ${T.border}` }}>
                        {item.name}
                      </a>
                    ) : (
                      <span style={{ fontSize: 13.5, color: T.ink }}>{item.name}</span>
                    )}
                  </div>
                ))}
                {(user.gear || []).length > 4 && (
                  <button onClick={() => setShowGear(true)}
                    style={{ alignSelf: "flex-start", marginTop: 8, background: "none", border: "none", fontSize: 11, color: T.inkLight, cursor: "pointer", fontFamily: "'EB Garamond', serif", fontStyle: "italic", padding: 0, letterSpacing: "0.04em" }}>
                    + {(user.gear || []).length - 4} more items →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── EXPLORE CTA ── */}
          <div style={{ padding: "24px", border: `1px solid ${T.border}`, borderRadius: 2, background: T.paper, textAlign: "center", marginBottom: 28 }}>
            <p style={{ fontSize: 14, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 14px" }}>
              {discovered === 0
                ? "Start exploring the network to discover photographers and build your lineage."
                : `You've discovered ${discovered} photographer${discovered === 1 ? "" : "s"}. Keep exploring.`}
            </p>
            <button onClick={onExplore}
              style={{ fontSize: 10.5, letterSpacing: "0.12em", padding: "9px 24px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
              EXPLORE THE NETWORK →
            </button>
          </div>

        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editing && (
        <div style={{ position: "absolute", inset: 0, background: T.paper, zIndex: 90, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Libre Baskerville', serif" }}>
              { editSection === "basic" ? "Edit Profile"
              : editSection === "photography" ? "My Photography"
              : editSection === "topics" ? "Talk to Me About"
              : editSection === "lighthouse" ? "Lighthouse Works"
              : editSection === "links" ? "Links"
              : "Influences" }
            </div>
            <button onClick={() => setEditing(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.inkLight, padding: 0 }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
            <div style={{ maxWidth: 500 }}>

              {/* BASIC */}
              {editSection === "basic" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "NAME", key: "name" },
                    { label: "BIRTH YEAR", key: "born" },
                    { label: "COUNTRY", key: "country" },
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
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>SHORT BIO</div>
                    <textarea value={draft.bio || ""} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} rows={2} placeholder="One or two lines about you…"
                      style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.ink, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
                  </div>
                </div>
              )}

              {/* MY PHOTOGRAPHY */}
              {editSection === "photography" && (
                <div>
                  <p style={{ fontSize: 13, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7, marginBottom: 14 }}>
                    What is your photography about? Your approach, your obsessions, what you're working on right now.
                  </p>
                  <textarea value={draft.myPhotography || ""} onChange={e => setDraft(d => ({ ...d, myPhotography: e.target.value }))} rows={8}
                    placeholder="My photography is about…"
                    style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", lineHeight: 1.8, background: "transparent", color: T.ink, outline: "none", resize: "none", boxSizing: "border-box" }} />
                </div>
              )}

              {/* TALK TO ME ABOUT */}
              {editSection === "topics" && (
                <div>
                  <p style={{ fontSize: 13, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7, marginBottom: 14 }}>
                    Pick topics you're happy to discuss with other photographers, or add your own.
                  </p>
                  {/* Selected topics */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {(draft.talkTopics || []).map(topic => (
                      <div key={topic} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px 4px 12px", border: `1px solid ${T.ink}`, borderRadius: 20, background: T.ink, color: T.bg }}>
                        {topic}
                        <button onClick={() => removeTopic(topic)} style={{ background: "none", border: "none", color: "rgba(249,247,242,0.6)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                  {/* Suggested topics */}
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 8 }}>SUGGESTED</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                    {TALK_TOPICS.filter(t => !(draft.talkTopics || []).includes(t)).map(topic => (
                      <button key={topic} onClick={() => addTopic(topic)}
                        style={{ fontSize: 11.5, padding: "4px 11px", border: `1px solid ${T.border}`, borderRadius: 20, background: "transparent", color: T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif" }}>
                        + {topic}
                      </button>
                    ))}
                  </div>
                  {/* Custom topic */}
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 6 }}>ADD YOUR OWN</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={topicInput} onChange={e => setTopicInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && topicInput.trim()) { addTopic(topicInput.trim()); setTopicInput(""); } }}
                      placeholder="Type a topic and press Enter…"
                      style={{ flex: 1, border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none" }} />
                    <button onClick={() => { if (topicInput.trim()) { addTopic(topicInput.trim()); setTopicInput(""); } }}
                      style={{ fontSize: 10, letterSpacing: "0.08em", padding: "4px 10px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
                      ADD
                    </button>
                  </div>
                </div>
              )}

              {/* LIGHTHOUSE WORKS */}
              {editSection === "lighthouse" && (
                <div>
                  <p style={{ fontSize: 13, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7, marginBottom: 16 }}>
                    Add up to 5 images that best represent your work. Paste a direct image URL from your website, portfolio, or anywhere public.
                  </p>
                  {/* Existing works */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {(draft.lighthouseWorks || []).map(work => (
                      <div key={work.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 2 }}>
                        <div style={{ width: 60, height: 45, flexShrink: 0, background: "rgba(26,24,18,0.05)", overflow: "hidden", borderRadius: 1 }}>
                          <img src={work.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: T.inkMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{work.url}</div>
                          {work.caption && <div style={{ fontSize: 11, color: T.inkLight, fontStyle: "italic", marginTop: 2 }}>{work.caption}</div>}
                        </div>
                        <button onClick={() => removeLighthouse(work.id)}
                          style={{ background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 16, padding: 0, flexShrink: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                  {/* Add new */}
                  {(draft.lighthouseWorks || []).length < 5 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px", border: `1px dashed ${T.border}`, borderRadius: 2 }}>
                      <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight }}>ADD IMAGE</div>
                      <input value={lighthouseDraft.url} onChange={e => setLighthouseDraft(d => ({ ...d, url: e.target.value }))}
                        placeholder="https://your-image-url.jpg"
                        style={{ border: "none", borderBottom: `1px solid ${T.border}`, padding: "5px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none" }} />
                      <input value={lighthouseDraft.caption} onChange={e => setLighthouseDraft(d => ({ ...d, caption: e.target.value }))}
                        placeholder="Caption (optional)"
                        style={{ border: "none", borderBottom: `1px solid ${T.border}`, padding: "5px 0", fontSize: 12, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.ink, outline: "none" }} />
                      <button onClick={addLighthouse}
                        style={{ alignSelf: "flex-start", fontSize: 10, letterSpacing: "0.1em", padding: "5px 12px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontFamily: "'EB Garamond', serif" }}>
                        ADD IMAGE
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* INFLUENCES */}
              {editSection === "influences" && (
                <div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {(draft.influences || []).map(infId => (
                      <div key={infId} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 10px", border: `1px solid rgba(74,111,165,0.3)`, borderRadius: 2 }}>
                        <span style={{ fontSize: 12, color: T.blue }}>{PHOTOGRAPHERS[infId]?.name}</span>
                        <button onClick={() => setDraft(d => ({ ...d, influences: d.influences.filter(i => i !== infId) }))}
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
                            <div key={id} onClick={() => { setDraft(d => ({ ...d, influences: [...(d.influences||[]), id] })); setInfSearch(""); }}
                              style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < matches.length-1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 8, alignItems: "baseline" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(74,111,165,0.05)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif" }}>{p.name}</span>
                              <span style={{ fontSize: 9, color: T.inkLight }}>{p.born} · {p.genre}</span>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* LINKS */}
              {editSection === "links" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "WEBSITE", key: "website", placeholder: "https://yourwebsite.com" },
                    { label: "INSTAGRAM", key: "instagram", placeholder: "https://instagram.com/yourhandle" },
                    { label: "TWITTER / X", key: "twitter", placeholder: "https://twitter.com/yourhandle" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
                      <input value={draft[key] || ""} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              )}

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
function AuthScreen({ onAuth }) {
  const { signup, login } = useCurrentUser();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [step, setStep] = useState(1); // signup: 1=credentials, 2=identity, 3=influences
  const [error, setError] = useState(null);
  const [infSearch, setInfSearch] = useState("");
  const [draft, setDraft] = useState({
    name: "", email: "", password: "", country: "", genre: "Street", born: "", bio: "", influences: [],
  });

  const handleLogin = () => {
    setError(null);
    const result = login({ email: draft.email, password: draft.password });
    if (result.error) setError(result.error);
    else onAuth(result.user);
  };

  const handleSignup = () => {
    if (!draft.name || !draft.email || !draft.password) { setError("Please fill in all fields."); return; }
    const user = signup(draft);
    onAuth(user);
  };

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 420, padding: "0 28px" }}>

        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 42, fontFamily: "'Libre Baskerville', serif", fontWeight: 600, color: T.ink, lineHeight: 1, marginBottom: 10 }}>Lineage</div>
          <div style={{ width: 28, height: 1, background: T.inkFaint, margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: T.inkLight, fontStyle: "italic", lineHeight: 1.7 }}>
            {mode === "login" ? "Welcome back." : step === 1 ? "Join the network." : step === 2 ? "Tell us about yourself." : "Who influenced you?"}
          </p>
        </div>

        {mode === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[{ label: "EMAIL", key: "email", type: "email" }, { label: "PASSWORD", key: "password", type: "password" }].map(({ label, key, type }) => (
              <div key={key}>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
                <input type={type} value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "7px 0", fontSize: 15, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            {error && <div style={{ fontSize: 12, color: T.red, fontStyle: "italic" }}>{error}</div>}
            <button onClick={handleLogin}
              style={{ marginTop: 8, padding: "10px", background: T.ink, border: "none", borderRadius: 2, color: T.bg, fontSize: 11, letterSpacing: "0.12em", cursor: "pointer", fontFamily: "'EB Garamond', serif" }}>
              SIGN IN
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: T.inkLight }}>
              No account?{" "}
              <span onClick={() => { setMode("signup"); setStep(1); setError(null); }}
                style={{ color: T.ink, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}>
                Join Lineage
              </span>
            </div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <span onClick={() => onAuth(null)}
                style={{ fontSize: 11, color: T.inkFaint, cursor: "pointer", letterSpacing: "0.06em" }}>
                EXPLORE WITHOUT ACCOUNT →
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Step indicator */}
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ height: 2, flex: 1, borderRadius: 1, background: step >= n ? T.ink : T.border, transition: "background 0.2s" }} />
              ))}
            </div>

            {step === 1 && (
              <>
                {[{ label: "FULL NAME", key: "name", type: "text" }, { label: "EMAIL", key: "email", type: "email" }, { label: "PASSWORD", key: "password", type: "password" }].map(({ label, key, type }) => (
                  <div key={key}>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
                    <input type={type} value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "7px 0", fontSize: 15, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </>
            )}

            {step === 2 && (
              <>
                {[{ label: "BIRTH YEAR", key: "born", placeholder: "e.g. 1988" }, { label: "COUNTRY OF BIRTH", key: "country", placeholder: "e.g. Germany" }].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>{label}</div>
                    <input value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} placeholder={placeholder}
                      style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "7px 0", fontSize: 15, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 6 }}>GENRE</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {["Street", "Documentary", "Portrait", "Landscape", "Fashion", "Fine Art", "War", "Conceptual", "Experimental"].map(g => (
                      <button key={g} onClick={() => setDraft(d => ({ ...d, genre: g }))}
                        style={{ fontSize: 10.5, padding: "3px 9px", border: `1px solid ${draft.genre === g ? T.ink : T.border}`, borderRadius: 2, background: draft.genre === g ? T.ink : "transparent", color: draft.genre === g ? T.bg : T.inkMid, cursor: "pointer", fontFamily: "'EB Garamond', serif", transition: "all 0.12s" }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>BIO <span style={{ color: T.inkFaint }}>(optional)</span></div>
                  <textarea value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} placeholder="A few words about your work…" rows={2}
                    style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 13, fontFamily: "'EB Garamond', serif", fontStyle: "italic", background: "transparent", color: T.ink, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
                </div>
              </>
            )}

            {step === 3 && (
              <div>
                <p style={{ fontSize: 13, color: T.inkMid, fontStyle: "italic", lineHeight: 1.7, marginBottom: 12 }}>Which photographers shaped your vision?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {(draft.influences || []).map(infId => (
                    <div key={infId} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 10px", border: `1px solid rgba(74,111,165,0.3)`, borderRadius: 2, background: "rgba(74,111,165,0.05)" }}>
                      <span style={{ fontSize: 11.5, color: T.blue, fontFamily: "'EB Garamond', serif" }}>{PHOTOGRAPHERS[infId]?.name}</span>
                      <button onClick={() => setDraft(d => ({ ...d, influences: d.influences.filter(i => i !== infId) }))}
                        style={{ background: "none", border: "none", color: "rgba(74,111,165,0.5)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  {draft.influences.length === 0 && <span style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic" }}>None yet — you can always add these later</span>}
                </div>
                <div style={{ position: "relative" }}>
                  <input autoFocus value={infSearch} onChange={e => setInfSearch(e.target.value)} placeholder="Search photographers…"
                    style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "6px 0", fontSize: 14, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box" }} />
                  {infSearch.trim().length > 0 && (() => {
                    const cur = new Set(draft.influences);
                    const matches = Object.entries(PHOTOGRAPHERS).filter(([id, p]) => !cur.has(id) && p.name.toLowerCase().includes(infSearch.toLowerCase())).slice(0, 5);
                    return matches.length > 0 ? (
                      <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: T.paper, border: `1px solid ${T.border}`, boxShadow: "0 6px 20px rgba(26,24,18,0.09)", zIndex: 10 }}>
                        {matches.map(([id, p], i) => (
                          <div key={id} onClick={() => { setDraft(d => ({ ...d, influences: [...d.influences, id] })); setInfSearch(""); }}
                            style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < matches.length-1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 8, alignItems: "baseline" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(74,111,165,0.05)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <span style={{ fontSize: 14, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>{p.name}</span>
                            <span style={{ fontSize: 9, color: T.inkLight }}>{p.born} · {p.genre}</span>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

            {error && <div style={{ fontSize: 12, color: T.red, fontStyle: "italic" }}>{error}</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ padding: "9px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid, fontSize: 10.5, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif" }}>
                  ← BACK
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => {
                  if (step === 1 && (!draft.name || !draft.email || !draft.password)) { setError("Please fill in all fields."); return; }
                  setError(null); setStep(s => s + 1);
                }}
                  style={{ flex: 1, padding: "9px", background: T.ink, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontSize: 11, letterSpacing: "0.12em", fontFamily: "'EB Garamond', serif" }}>
                  NEXT →
                </button>
              ) : (
                <button onClick={handleSignup}
                  style={{ flex: 1, padding: "9px", background: T.amber, border: "none", borderRadius: 2, cursor: "pointer", color: T.bg, fontSize: 11, letterSpacing: "0.12em", fontFamily: "'EB Garamond', serif" }}>
                  JOIN LINEAGE
                </button>
              )}
            </div>

            <div style={{ textAlign: "center", fontSize: 12, color: T.inkLight, marginTop: 4 }}>
              Already have an account?{" "}
              <span onClick={() => { setMode("login"); setError(null); }} style={{ color: T.ink, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}>Sign in</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span onClick={() => onAuth(null)} style={{ fontSize: 11, color: T.inkFaint, cursor: "pointer", letterSpacing: "0.06em" }}>
                EXPLORE WITHOUT ACCOUNT →
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Lineage() {
  // ── DATA ──
  const { data: PHOTOGRAPHERS, loading: dataLoading } = usePhotographers();
  const { user, signup, login, logout, updateUser } = useCurrentUser();

  // ── APP ROUTING STATE ──
  const [appView, setAppView] = useState(() => {
    // Show disclaimer on first ever visit
    const seenDisclaimer = localStorage.getItem(DISCLAIMER_KEY);
    if (!seenDisclaimer) return "disclaimer";
    if (user) return "profile";
    return "auth";
  });

  // ── PERSONAL GRAPH STATE ──
  const [nodeStates, setNodeStates] = useState(() => {
    try {
      const saved = user ? localStorage.getItem(`lineage_nodes_${user.id}`) : null;
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // ── USER PROFILE STATE ──
  const freshUserRef = useRef(null);
  const activeUser = freshUserRef.current || user;
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
  const [disputes, setDisputes]         = useState({
    "robert-capa--henri-cartier-bresson": 1, // direction of influence debated
    "man-ray--lee-miller":                2, // collaborative vs directional
    "weegee--diane-arbus":               1, // indirect influence disputed
  });
  // Tracks which edges the current user has flagged (prevents double-flagging)
  const [userFlags, setUserFlags]       = useState(new Set()); // session overrides keyed by photographer id
  const [selected, setSelected]         = useState(null);
  const [hovered, setHovered]           = useState(null);
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

  // Centre the graph on first load and whenever returning to graph view
  useEffect(() => {
    if (centredRef.current) return;
    const ids = Object.keys(scaledPos);
    if (!dims.w || !dims.h || ids.length === 0) return;
    centredRef.current = true;
    const cx = ids.reduce((s, id) => s + scaledPos[id].x, 0) / ids.length;
    const cy = ids.reduce((s, id) => s + scaledPos[id].y, 0) / ids.length;
    setPan({ x: dims.w / 2 - cx, y: dims.h / 2 - cy });
  }, [dims, scaledPos]);

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

  const switchMode = (m) => {
    setMode(m); setSelected(null); setSheetOpen(false); setEditMode(false);
    setPathFrom(null); setPathTo(null); setPathResult(null); setSearchTarget(null);
    setExploreSearch(false); setExploreQuery("");
    zoomOut();
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
    else { setSelected(id); setSheetOpen(true); setEditMode(false); panToNode(id); }
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
      const dx = e.touches[0].clientX - touchRef.current.startX;
      const dy = e.touches[0].clientY - touchRef.current.startY;
      // Mark as moved if finger travelled more than 6px
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) touchRef.current.moved = true;
      if (touchRef.current.moved) {
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

      // New scale proportional to finger spread
      const newScale = Math.min(4.5, Math.max(0.15, startScale * (dist / startDist)));

      // Adjust pan so the pinch midpoint stays fixed in the graph
      // The graph point under midX,midY at startScale was at graph coords:
      //   gx = (midX - startPanX) / 1  (no CSS scale, just pan)
      // After scale change, to keep same graph point under midX,midY:
      //   newPan = mid - gx  →  same as: mid - (mid - startPan) * (newScale/startScale)
      // But since we don't CSS-scale, spreading nodes changes via scaledPos not CSS,
      // so pan just tracks finger movement relative to start:
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

      // Touch position relative to container
      const localX = touch.clientX - rect.left;
      const localY = touch.clientY - rect.top;

      // Touch position in graph space (subtract pan)
      const graphX = localX - pan.x;
      const graphY = localY - pan.y;

      let nearestId = null;
      let nearestDist = TAP_RADIUS;

      Object.entries(scaledPos).forEach(([id, pos]) => {
        const dx = graphX - pos.x;
        const dy = graphY - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = id;
        }
      });

      if (nearestId) {
        handleNodeTap(nearestId);
      } else {
        // Tap on empty canvas — deselect
        setSelected(null);
        setSheetOpen(false);
        setEditMode(false);
      }
    }

    if (e.touches.length === 1) {
      touchRef.current = {
        mode: "pan",
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        panOriginX: pan.x,
        panOriginY: pan.y,
        moved: false,
        wasPinch: true, // came from a pinch — suppress tap
        startTime: Date.now(),
      };
      lastTouchDist.current = null;
    } else if (e.touches.length === 0) {
      touchRef.current = null;
      lastTouchDist.current = null;
    }
  }, [pan]);

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

  // Path search filtered list
  const filtered = Object.entries(PHOTOGRAPHERS)
    .filter(([, p]) => p.name.toLowerCase().includes(pathSearchQuery.toLowerCase()))
    .sort((a, b) => a[1].born - b[1].born);

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

  const allGenres = ["Street", "Documentary", "Portrait", "Landscape", "Fashion", "Fine Art", "War", "Conceptual", "Experimental"];

  const filterActive = filterCountry || filterGenre;

  const filteredIds = useMemo(() => {
    if (!filterCountry && !filterGenre) return null; // null = show all
    return new Set(Object.entries(PHOTOGRAPHERS)
      .filter(([, p]) => {
        const countryMatch = !filterCountry || p.country === filterCountry;
        const genreMatch   = !filterGenre   || p.genre === filterGenre;
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
  const flagCount = (a, b) => disputes[edgeKey(a, b)] || 0;
  const isDisputed = (a, b) => flagCount(a, b) >= DISPUTE_THRESHOLD;
  const hasUserFlagged = (a, b) => userFlags.has(edgeKey(a, b));
  const flagConnection = (a, b) => {
    const key = edgeKey(a, b);
    if (userFlags.has(key)) return;
    setUserFlags(prev => new Set([...prev, key]));
    setDisputes(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  // ── ROUTING — all hooks declared above, safe to return early now ──

  const handleAuth = (u) => {
    freshUserRef.current = u;
    setAppView(u ? "profile" : "graph");
  };

  if (appView === "sources") return (
    <SourcesPage onBack={() => setAppView(user ? "profile" : "graph")} PHOTOGRAPHERS={PHOTOGRAPHERS} />
  );

  if (appView === "disclaimer") return (
    <DisclaimerPage
      feedbackUrl={FEEDBACK_URL}
      onEnter={() => {
        localStorage.setItem(DISCLAIMER_KEY, "1");
        setAppView(user ? "profile" : "auth");
      }}
    />
  );

  if (appView === "auth") return <AuthScreen onAuth={handleAuth} />;

  if (appView === "profile" && activeUser) return (
    <ProfilePage
      user={activeUser}
      onExplore={() => { setAppView("graph"); setOnboarding(false); }}
      onLogout={() => { freshUserRef.current = null; logout(); setAppView("auth"); }}
      updateUser={updateUser}
      nodeStates={nodeStates}
      setNodeStates={setNodeStates}
      PHOTOGRAPHERS={PHOTOGRAPHERS}
    />
  );

  // Loading state — shown while fetching from backend (instant with static data)
  if (dataLoading) return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville', serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: T.ink, marginBottom: 12 }}>Lineage</div>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", color: T.inkLight }}>LOADING…</div>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", display: "flex", flexDirection: "column", overflow: "hidden", color: T.ink, position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header style={{ padding: isMobile ? "11px 14px 9px" : "13px 26px 11px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", background: T.paper, flexShrink: 0, zIndex: 50, gap: 12 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: isMobile ? 17 : 21, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1 }}>Lineage</div>
          {!isMobile && <div style={{ fontSize: 9.5, letterSpacing: "0.13em", color: T.inkLight, marginTop: 3 }}>A MAP OF PHOTOGRAPHIC INFLUENCE</div>}
        </div>

        {/* Explore search bar — expands inline */}
        {mode === "explore" && (
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
                <button onClick={() => { setExploreSearch(false); setExploreQuery(""); }}
                  style={{ position: "absolute", right: 0, background: "none", border: "none", color: T.inkLight, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>

                {/* Dropdown results */}
                {exploreResults.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: T.paper, border: `1px solid ${T.border}`, zIndex: 100, boxShadow: "0 8px 24px rgba(26,24,18,0.1)", overflow: "hidden" }}>
                    {exploreResults.map(([id, p], i) => (
                      <div key={id}
                        onClick={() => {
                          setSelected(id); setSheetOpen(true);
                          setExploreSearch(false); setExploreQuery("");
                          panToNode(id);
                        }}
                        style={{ padding: "9px 14px", cursor: "pointer", borderBottom: i < exploreResults.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "baseline", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,24,18,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: 13.5, fontFamily: "'Libre Baskerville', serif", color: T.ink }}>{p.name}</span>
                        <span style={{ fontSize: 9, color: T.inkLight, letterSpacing: "0.05em" }}>{p.born} · {p.style}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setExploreSearch(true); setTimeout(() => exploreInputRef.current?.focus(), 50); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.inkLight, display: "flex", alignItems: "center", gap: 5, fontSize: 11, letterSpacing: "0.08em", fontFamily: "'EB Garamond', serif", padding: "4px 8px" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="5.5" cy="5.5" r="4" />
                  <line x1="8.5" y1="8.5" x2="12" y2="12" />
                </svg>
                {!isMobile && "SEARCH"}
              </button>
            )}
          </div>
        )}

        {!exploreSearch && mode === "explore" && (
          <div style={{ fontSize: 9, color: T.inkFaint, letterSpacing: "0.09em", transition: "opacity 0.4s", opacity: showNames ? 0 : 0.7, flexShrink: 0, pointerEvents: "none" }}>
            {isMobile ? "PINCH FOR NAMES" : "SCROLL FOR NAMES"}
          </div>
        )}

        <div style={{ marginLeft: mode === "explore" && exploreSearch ? 0 : "auto", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(o => !o)}
            style={{
              padding: isMobile ? "5px 10px" : "5px 14px",
              background: filterActive ? T.ink : "transparent",
              border: `1px solid ${filterActive ? T.ink : T.border}`,
              borderRadius: 2, cursor: "pointer",
              color: filterActive ? T.bg : T.inkLight,
              fontSize: 10.5, letterSpacing: "0.1em",
              fontFamily: "'EB Garamond', serif",
              transition: "all 0.15s",
              position: "relative",
            }}>
            FILTER{filterActive ? ` ·${filterCountry ? " " + filterCountry : ""}${filterGenre ? " " + filterGenre : ""}` : ""}
          </button>

          {/* Explore / Path toggle */}
          <div style={{ display: "flex", border: `1px solid ${T.border}`, borderRadius: 2, overflow: "hidden" }}>
            {[["explore", "Explore"], ["path", "Path"]].map(([m, label]) => (
              <button key={m} onClick={() => switchMode(m)} style={{ padding: isMobile ? "5px 11px" : "5px 16px", background: mode === m ? T.ink : "transparent", border: "none", cursor: "pointer", color: mode === m ? T.bg : T.inkLight, fontSize: 10.5, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif", transition: "all 0.15s" }}>
                {label.toUpperCase()}
              </button>
            ))}
          </div>
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
        <div style={{ padding: isMobile ? "7px 12px" : "7px 22px", background: T.paper, borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center", flexShrink: 0, zIndex: 40 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.12em", color: T.inkLight }}>FROM</span>
          <PathPicker value={pathFrom} isActive={searchTarget === "from"} placeholder="select" isMobile={isMobile}
            onClick={() => { setSearchTarget("from"); setSearchOpen(true); setPathSearchQuery(""); }} />
          <span style={{ color: T.inkFaint, fontSize: 13 }}>—</span>
          <span style={{ fontSize: 9, letterSpacing: "0.12em", color: T.inkLight }}>TO</span>
          <PathPicker value={pathTo} isActive={searchTarget === "to"} placeholder="select" isMobile={isMobile}
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
      <div ref={containerRef}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
        style={{ flex: 1, position: "relative", overflow: "hidden", cursor: isPanning ? "grabbing" : "crosshair", touchAction: "none" }}
      >
        {/* paper texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.016'/%3E%3C/svg%3E")`,
        }} />

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
                const pathIdx = pathResult
                  ? Math.min(pathResult.indexOf(id), pathResult.indexOf(infId))
                  : -1;
                const isLit      = isPathEdge && pathIdx < pathStep;
                const isHL       = !!(activeId && (id === activeId || infId === activeId));
                const disputed   = isDisputed(id, infId);
                const nearThresh = !disputed && flagCount(id, infId) > 0;
                const edgeInFilter = !filteredIds || (filteredIds.has(id) && filteredIds.has(infId));

                // Check if this connection is confirmed or pending
                const eKey2 = edgeKey(id, infId);
                const eKey3 = edgeKey(infId, id);
                const connSource = CONNECTION_SOURCES[eKey2] || CONNECTION_SOURCES[eKey3] || null;
                const isPending = !connSource || connSource.status !== "confirmed";

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
                        ? disputed ? T.amber : T.ink
                        : isSecondOrder ? T.inkFaint
                        : disputed ? "rgba(160,96,32,0.55)"
                        : nearThresh ? "rgba(160,96,32,0.3)"
                        : T.line
                    }
                    strokeWidth={isLit ? 1.5 : isHL ? 0.9 : isSecondOrder ? 0.35 : 0.45}
                    strokeOpacity={
                      !edgeInFilter ? 0
                      : isLit ? 1
                      : isHL ? 0.65
                      : isSecondOrder ? 0.18
                      : (disputed || nearThresh) ? 0.25
                      : 0
                    }
                    strokeDasharray={
                      disputed ? "4 4"
                      : nearThresh ? "6 6"
                      : isPending && (isHL || isLit) ? "2 3"
                      : "none"
                    }
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
            const isLitNode = pathResult && pathResult.indexOf(id) <= pathStep;
            const inHL      = highlighted.size > 0 && highlighted.has(id);
            const exploreActive = mode === "explore" && highlighted.size > 0;

            const inFilter = !filteredIds || filteredIds.has(id);
            const isSecondOrderNode = activeId && secondOrder.has(id);
            const opacity = mode === "path"
              ? (!inFilter ? 0.07
                : pathResult ? (isInPath ? 1 : 0.13)
                : (pathFrom === id || pathTo === id ? 1 : 0.35))
              : (exploreActive
                  ? (inHL ? 1 : isSecondOrderNode ? 0.35 : 0.07)
                  : (inFilter ? 1 : 0.1));

            const activeInfluences = activeId
              ? activeId === "__user__"
                ? (userProfile?.influences || [])
                : (localEdits[activeId]?.influences ?? PHOTOGRAPHERS[activeId]?.influences ?? [])
              : [];
            const isInfluencer = activeId && activeInfluences.includes(id);
            const isInfluenced = activeId && id !== activeId && (localEdits[id]?.influences ?? PHOTOGRAPHERS[id]?.influences ?? []).includes(activeId);

            const connNorm = connCounts[id] / maxConn;
            const BASE = 3.2, RANGE = 4.2;
            const r = isSel || isLitNode ? BASE + RANGE + 3.5
              : isHov ? BASE + RANGE + 2
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
                onMouseEnter={() => !isMobile && setHovered(id)}
                onMouseLeave={() => !isMobile && setHovered(null)}
                onClick={() => handleNodeTap(id)}
                style={{
                  position: "absolute",
                  left: pos.x, top: pos.y,
                  transform: "translate(-50%, -50%)",
                  width: 22, height: 22,
                  opacity,
                  transition: "opacity 0.22s",
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
                  opacity: showNames || isSel || isHov || isInPath ? 1 : 0,
                  transition: "opacity 0.4s",
                  pointerEvents: "none",
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
              <PhotographerPortrait id={selected} name={currentP.name} size={isMobile ? 56 : 68} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 8.5, letterSpacing: "0.13em", color: T.inkLight, marginBottom: 2 }}>
                      {currentP.country} · {currentP.years}
                    </div>
                    <div style={{ fontSize: isMobile ? 16 : 21, fontWeight: 600, fontFamily: "'Libre Baskerville', serif", lineHeight: 1.1, whiteSpace: isMobile ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {currentP.name}
                    </div>
                    <div style={{ fontSize: 10.5, color: T.inkLight, marginTop: 2, letterSpacing: "0.03em" }}>
                      {editMode && editDraft ? editDraft.style : currentP.style}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    {/* Edit / Save / Cancel buttons */}
                    {!editMode ? (
                      <button
                        onClick={() => { setEditDraft({ bio: currentP.bio, style: currentP.style, links: { ...currentP.links }, influences: [...(currentP.influences || [])] }); setInfSearch(""); setEditMode(true); }}
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
                  <button onClick={() => { switchMode("path"); setPathFrom(selected); }}
                    style={{ marginTop: 7, fontSize: 8.5, letterSpacing: "0.1em", padding: "4px 8px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 2, cursor: "pointer", color: T.inkMid }}>
                    TRACE PATH →
                  </button>
                )}
              </div>
            </div>

            {/* ── SHEET BODY ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "11px 18px 16px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 18 }}>

              {editMode && editDraft ? (
                /* ── EDIT FORM ── */
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.inkLight, marginBottom: 5 }}>STYLE</div>
                    <input
                      value={editDraft.style}
                      onChange={e => setEditDraft(d => ({ ...d, style: e.target.value }))}
                      style={{ width: "100%", border: "none", borderBottom: `1px solid ${T.border}`, padding: "4px 0", fontSize: 12, fontFamily: "'EB Garamond', serif", background: "transparent", color: T.ink, outline: "none", boxSizing: "border-box", letterSpacing: "0.03em" }}
                    />
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
                        const disputed = isDisputed(selected, infId);
                        const flags    = flagCount(selected, infId);
                        return (
                          <div key={infId} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "3px 8px 3px 10px",
                            border: `1px solid ${disputed ? "rgba(160,96,32,0.4)" : "rgba(74,111,165,0.3)"}`,
                            borderRadius: 2,
                            background: disputed ? "rgba(160,96,32,0.05)" : "rgba(74,111,165,0.05)",
                          }}>
                            <span style={{ fontSize: 11.5, color: disputed ? T.amber : T.blue, fontFamily: "'EB Garamond', serif" }}>
                              {PHOTOGRAPHERS[infId]?.name || infId}
                            </span>
                            {disputed && <span style={{ fontSize: 8, color: T.amber, letterSpacing: "0.06em" }}>DISPUTED</span>}
                            {!disputed && flags > 0 && <span style={{ fontSize: 8, color: T.inkFaint }}>{flags}/{DISPUTE_THRESHOLD}</span>}
                            <button
                              onClick={() => flagConnection(selected, infId)}
                              disabled={hasUserFlagged(selected, infId) || disputed}
                              title="Flag as disputed"
                              style={{ background: "none", border: "none", color: hasUserFlagged(selected, infId) ? T.amber : T.inkFaint, cursor: disputed || hasUserFlagged(selected, infId) ? "default" : "pointer", fontSize: 10, padding: 0, lineHeight: 1 }}>
                              ⚐
                            </button>
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
                            const disputed   = isDisputed(selected, infId);
                            const flags      = flagCount(selected, infId);
                            const alreadyFlagged = hasUserFlagged(selected, infId);
                            return (
                              <div key={infId} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <span onClick={() => { setSelected(infId); panToNode(infId); }}
                                  style={{ fontSize: 12.5, color: disputed ? T.amber : T.blue, cursor: "pointer", borderBottom: `1px ${disputed ? "dashed" : "solid"} ${disputed ? "rgba(160,96,32,0.35)" : "rgba(74,111,165,0.22)"}`, paddingBottom: 1 }}>
                                  {PHOTOGRAPHERS[infId]?.name}
                                </span>
                                {disputed && (
                                  <span style={{ fontSize: 8.5, color: T.amber, letterSpacing: "0.06em", border: `1px solid rgba(160,96,32,0.3)`, padding: "1px 5px", borderRadius: 2 }}>
                                    DISPUTED
                                  </span>
                                )}
                                {!disputed && flags > 0 && (
                                  <span style={{ fontSize: 8.5, color: T.inkFaint, letterSpacing: "0.05em" }}>
                                    {flags}/{DISPUTE_THRESHOLD} flagged
                                  </span>
                                )}
                                <button
                                  onClick={() => flagConnection(selected, infId)}
                                  disabled={alreadyFlagged || disputed}
                                  title={alreadyFlagged ? "You've flagged this" : "Flag as disputed"}
                                  style={{
                                    background: "none", border: "none", cursor: alreadyFlagged || disputed ? "default" : "pointer",
                                    padding: 0, fontSize: 10, lineHeight: 1,
                                    color: alreadyFlagged ? T.amber : T.inkFaint,
                                    opacity: disputed ? 0 : 1,
                                    transition: "color 0.15s",
                                  }}
                                  onMouseEnter={e => { if (!alreadyFlagged && !disputed) e.currentTarget.style.color = T.amber; }}
                                  onMouseLeave={e => { if (!alreadyFlagged) e.currentTarget.style.color = T.inkFaint; }}
                                >
                                  {alreadyFlagged ? "⚑" : "⚐"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {influenced.length > 0 && (
                        <div>
                          <div style={{ fontSize: 8, letterSpacing: "0.12em", color: T.red, marginBottom: 5 }}>INFLUENCED</div>
                          {influenced.map(infId => (
                            <span key={infId} onClick={() => { setSelected(infId); panToNode(infId); }}
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
                    <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 4, flexWrap: "wrap" }}>
                      {Object.entries(currentP.links).filter(([, v]) => v).map(([type, url]) => (
                        <a key={type} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11.5, color: T.inkMid, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", border: `1px solid ${T.border}`, gap: 7 }}>
                          {LINK_LABELS[type]} <span style={{ color: T.inkLight, fontSize: 10 }}>↗</span>
                        </a>
                      ))}
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
                <div style={{ fontSize: 14.5, fontFamily: "'Libre Baskerville', serif" }}>{p.name}</div>
                <div style={{ fontSize: 9.5, color: T.inkLight, letterSpacing: "0.04em" }}>{p.born} · {p.style}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ padding: "5px 14px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", background: T.paper, flexShrink: 0, zIndex: 30, gap: 10, overflow: "hidden" }}>
        {/* Legend — hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
            {[{ c: T.blue, l: "INFLUENCED BY" }, { c: T.red, l: "INFLUENCED" }].map(({ c, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />{l}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
              <svg width={18} height={6} style={{ flexShrink: 0 }}>
                <line x1={0} y1={3} x2={18} y2={3} stroke={T.inkMid} strokeWidth={1.2} strokeDasharray="none" />
              </svg>
              CONFIRMED
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
              <svg width={18} height={6} style={{ flexShrink: 0 }}>
                <line x1={0} y1={3} x2={18} y2={3} stroke={T.inkMid} strokeWidth={1.2} strokeDasharray="2 3" />
              </svg>
              PENDING
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.1em", color: T.inkFaint }}>
              <svg width={18} height={6} style={{ flexShrink: 0 }}>
                <line x1={0} y1={3} x2={18} y2={3} stroke={T.amber} strokeWidth={1.2} strokeDasharray="4 4" />
              </svg>
              DISPUTED
            </div>
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

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
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
          {!isMobile && (
            <div style={{ fontSize: 8, letterSpacing: "0.09em", color: T.inkFaint, whiteSpace: "nowrap" }}>
              {Object.keys(PHOTOGRAPHERS).length} photographers · {Object.values(PHOTOGRAPHERS).reduce((a, p) => a + p.influences.length, 0)} connections
            </div>
          )}
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 8.5, letterSpacing: "0.1em", color: T.bg, textDecoration: "none", background: T.amber, padding: "3px 9px", borderRadius: 2, whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
            SHARE FEEDBACK
          </a>
          <button onClick={() => setAppView("sources")}
            style={{ fontSize: 8.5, letterSpacing: "0.08em", color: T.inkLight, background: "transparent", border: `1px solid ${T.border}`, padding: "3px 9px", borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'EB Garamond', serif" }}>
            SOURCES
          </button>
        </div>
      </div>
      {/* ── USER PROFILE SHEET ── */}
      {selected === "__user__" && userProfile && sheetOpen && (
        <div style={{ flexShrink: 0, height: isMobile ? "60dvh" : "320px", background: T.paper, borderTop: `1px solid ${T.amber}`, zIndex: 65, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "11px 18px 9px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", gap: 14, flexShrink: 0 }}>
            {/* Amber dot */}
            <div style={{ width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: "50%", background: T.amber, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: isMobile ? 20 : 24, fontFamily: "'Libre Baskerville', serif", color: T.bg, fontWeight: 600 }}>
                {userProfile.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
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

      {/* ── ONBOARDING OVERLAY ── */}
      {onboarding && (
        <div
          onClick={dismissOnboarding}
          style={{
            position: "absolute", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `rgba(245,242,236,${onboardFading ? 0 : 0.94})`,
            backdropFilter: onboardFading ? "none" : "blur(3px)",
            transition: "background 0.6s ease, backdrop-filter 0.6s ease",
            cursor: "pointer",
          }}
        >
          <div style={{
            textAlign: "center",
            opacity: onboardFading ? 0 : 1,
            transform: onboardFading ? "translateY(-8px)" : "translateY(0)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            padding: isMobile ? "0 28px" : "0 32px",
            maxWidth: 520,
          }}>
            {/* Wordmark */}
            <div style={{
              fontSize: isMobile ? 44 : 58,
              fontFamily: "'Libre Baskerville', serif",
              fontWeight: 600, letterSpacing: "0.01em",
              color: T.ink, lineHeight: 1, marginBottom: 18,
            }}>
              Lineage
            </div>

            {/* Rule */}
            <div style={{ width: 32, height: 1, background: T.inkFaint, margin: "0 auto 22px" }} />

            {/* Lead line */}
            <p style={{
              fontSize: isMobile ? 16 : 18,
              fontFamily: "'EB Garamond', serif",
              color: T.inkMid, lineHeight: 1.75,
              margin: "0 0 14px", fontStyle: "italic",
            }}>
              Discover photographers through the people who shaped them.
            </p>

            {/* Body */}
            <p style={{
              fontSize: isMobile ? 13 : 14.5,
              fontFamily: "'EB Garamond', serif",
              color: T.inkLight, lineHeight: 1.85,
              margin: "0 0 10px",
            }}>
              {Object.keys(PHOTOGRAPHERS).length} photographers. Two centuries of influence.
              Explore the connections, trace paths between artists,
              filter by country or genre — and find your next obsession
              through shared taste rather than an algorithm.
            </p>

            <p style={{
              fontSize: isMobile ? 13 : 14.5,
              fontFamily: "'EB Garamond', serif",
              color: T.inkLight, lineHeight: 1.85,
              margin: "0 0 36px",
            }}>
              Add yourself to the network, map your own influences,
              and forge your own path through photographic history.
            </p>

            {/* Three feature hints */}
            {!isMobile && (
              <div style={{ display: "flex", gap: 28, justifyContent: "center", marginBottom: 36 }}>
                {[
                  { icon: "◎", label: "Explore", desc: "Tap any node" },
                  { icon: "→", label: "Trace paths", desc: "Connect any two" },
                  { icon: "●", label: "Add yourself", desc: "Join the network" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, color: T.inkMid, marginBottom: 5, fontFamily: "'EB Garamond', serif" }}>{icon}</div>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: T.inkMid, fontFamily: "'EB Garamond', serif" }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: T.inkFaint, fontFamily: "'EB Garamond', serif", marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div
              style={{
                display: "inline-block",
                fontSize: 11, letterSpacing: "0.14em",
                fontFamily: "'EB Garamond', serif",
                color: T.inkMid,
                border: `1px solid ${T.border}`,
                padding: "10px 28px",
                borderRadius: 2,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.ink; e.currentTarget.style.color = T.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.inkMid; }}
            >
              EXPLORE THE GRAPH
            </div>

            {/* Hint */}
            <div style={{
              marginTop: 16, fontSize: 10,
              fontFamily: "'EB Garamond', serif",
              color: T.inkFaint, letterSpacing: "0.08em",
            }}>
              {isMobile ? "or tap anywhere to begin" : "or scroll to begin"}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function PathPicker({ value, isActive, placeholder, onClick, isMobile }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 9px",
      background: isActive ? "rgba(26,24,18,0.05)" : "transparent",
      border: `1px solid ${isActive ? "rgba(26,24,18,0.28)" : T.border}`,
      borderRadius: 2, cursor: "pointer",
      color: value ? T.ink : T.inkLight,
      fontSize: isMobile ? 10.5 : 11.5,
      fontFamily: "'EB Garamond', serif",
      letterSpacing: "0.03em",
      minWidth: isMobile ? 95 : 135,
      textAlign: "left", transition: "all 0.15s",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    }}>
      {value ? PHOTOGRAPHERS[value]?.name : placeholder}
    </button>
  );
}
