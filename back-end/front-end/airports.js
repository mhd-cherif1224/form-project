const AIRPORTS = [
    // ---------------- France ----------------
    { name: "Aéroport Paris-Charles de Gaulle", city: "Paris", country: "France", iata: "CDG" },
    { name: "Aéroport de Paris-Orly", city: "Paris", country: "France", iata: "ORY" },
    { name: "Aéroport de Lyon-Saint Exupéry", city: "Lyon", country: "France", iata: "LYS" },
    { name: "Aéroport de Nice Côte d'Azur", city: "Nice", country: "France", iata: "NCE" },
    { name: "Aéroport de Marseille Provence", city: "Marseille", country: "France", iata: "MRS" },
    { name: "Aéroport de Toulouse-Blagnac", city: "Toulouse", country: "France", iata: "TLS" },
    { name: "Aéroport de Bordeaux-Mérignac", city: "Bordeaux", country: "France", iata: "BOD" },

    // ---------------- Algeria ----------------
    { name: "Aéroport d'Alger - Houari Boumediene", city: "Alger", country: "Algérie", iata: "ALG" },
    { name: "Aéroport d'Oran Ahmed Ben Bella", city: "Oran", country: "Algérie", iata: "ORN" },
    { name: "Aéroport de Constantine Mohamed Boudiaf", city: "Constantine", country: "Algérie", iata: "CZL" },
    { name: "Aéroport d'Annaba Rabah Bitat", city: "Annaba", country: "Algérie", iata: "AAE" },
    { name: "Aéroport de Sétif Ain Arnat", city: "Sétif", country: "Algérie", iata: "QSF" },
    { name: "Aéroport de Béjaïa Soummam", city: "Béjaïa", country: "Algérie", iata: "BJA" },
    { name: "Aéroport de Tlemcen Zenata", city: "Tlemcen", country: "Algérie", iata: "TLM" },
    { name: "Aéroport de Batna Mostafa Ben Boulaïd", city: "Batna", country: "Algérie", iata: "BLJ" },
    { name: "Aéroport de Tamanrasset Aguenar", city: "Tamanrasset", country: "Algérie", iata: "TMR" },
    { name: "Aéroport d'Ouargla Ain Beida", city: "Ouargla", country: "Algérie", iata: "OGX" },

    // ---------------- Morocco / Tunisia / Egypt / North Africa ----------------
    { name: "Aéroport Mohammed V", city: "Casablanca", country: "Maroc", iata: "CMN" },
    { name: "Aéroport Marrakech-Ménara", city: "Marrakech", country: "Maroc", iata: "RAK" },
    { name: "Aéroport Rabat-Salé", city: "Rabat", country: "Maroc", iata: "RBA" },
    { name: "Aéroport Tunis-Carthage", city: "Tunis", country: "Tunisie", iata: "TUN" },
    { name: "Cairo International Airport", city: "Cairo", country: "Egypt", iata: "CAI" },

    // ---------------- United Kingdom ----------------
    { name: "London Heathrow", city: "London", country: "United Kingdom", iata: "LHR" },
    { name: "London Gatwick", city: "London", country: "United Kingdom", iata: "LGW" },
    { name: "London Stansted", city: "London", country: "United Kingdom", iata: "STN" },
    { name: "Manchester Airport", city: "Manchester", country: "United Kingdom", iata: "MAN" },
    { name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom", iata: "EDI" },

    // ---------------- Rest of Europe ----------------
    { name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", iata: "FRA" },
    { name: "Munich Airport", city: "Munich", country: "Germany", iata: "MUC" },
    { name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany", iata: "BER" },
    { name: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands", iata: "AMS" },
    { name: "Madrid-Barajas Airport", city: "Madrid", country: "Spain", iata: "MAD" },
    { name: "Barcelona-El Prat Airport", city: "Barcelona", country: "Spain", iata: "BCN" },
    { name: "Rome Fiumicino Airport", city: "Rome", country: "Italy", iata: "FCO" },
    { name: "Milan Malpensa Airport", city: "Milan", country: "Italy", iata: "MXP" },
    { name: "Zurich Airport", city: "Zurich", country: "Switzerland", iata: "ZRH" },
    { name: "Geneva Airport", city: "Geneva", country: "Switzerland", iata: "GVA" },
    { name: "Brussels Airport", city: "Brussels", country: "Belgium", iata: "BRU" },
    { name: "Vienna International Airport", city: "Vienna", country: "Austria", iata: "VIE" },
    { name: "Lisbon Portela Airport", city: "Lisbon", country: "Portugal", iata: "LIS" },
    { name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", iata: "CPH" },
    { name: "Oslo Airport", city: "Oslo", country: "Norway", iata: "OSL" },
    { name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", iata: "ARN" },
    { name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland", iata: "HEL" },
    { name: "Dublin Airport", city: "Dublin", country: "Ireland", iata: "DUB" },
    { name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", iata: "WAW" },
    { name: "Athens International Airport", city: "Athens", country: "Greece", iata: "ATH" },
    { name: "Istanbul Airport", city: "Istanbul", country: "Turkey", iata: "IST" },
    { name: "Sabiha Gökçen International Airport", city: "Istanbul", country: "Turkey", iata: "SAW" },
    { name: "Moscow Sheremetyevo Airport", city: "Moscow", country: "Russia", iata: "SVO" },

    // ---------------- North America ----------------
    { name: "John F. Kennedy International", city: "New York", country: "USA", iata: "JFK" },
    { name: "Newark Liberty International", city: "Newark", country: "USA", iata: "EWR" },
    { name: "Los Angeles International", city: "Los Angeles", country: "USA", iata: "LAX" },
    { name: "Chicago O'Hare International", city: "Chicago", country: "USA", iata: "ORD" },
    { name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "USA", iata: "ATL" },
    { name: "Dallas/Fort Worth International", city: "Dallas", country: "USA", iata: "DFW" },
    { name: "San Francisco International", city: "San Francisco", country: "USA", iata: "SFO" },
    { name: "Miami International", city: "Miami", country: "USA", iata: "MIA" },
    { name: "Seattle-Tacoma International", city: "Seattle", country: "USA", iata: "SEA" },
    { name: "Boston Logan International", city: "Boston", country: "USA", iata: "BOS" },
    { name: "Washington Dulles International", city: "Washington D.C.", country: "USA", iata: "IAD" },
    { name: "Toronto Pearson International", city: "Toronto", country: "Canada", iata: "YYZ" },
    { name: "Montréal-Trudeau International", city: "Montreal", country: "Canada", iata: "YUL" },
    { name: "Vancouver International", city: "Vancouver", country: "Canada", iata: "YVR" },
    { name: "Mexico City International", city: "Mexico City", country: "Mexico", iata: "MEX" },

    // ---------------- Middle East ----------------
    { name: "Dubai International", city: "Dubai", country: "UAE", iata: "DXB" },
    { name: "Abu Dhabi International", city: "Abu Dhabi", country: "UAE", iata: "AUH" },
    { name: "Hamad International Airport", city: "Doha", country: "Qatar", iata: "DOH" },
    { name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia", iata: "JED" },
    { name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia", iata: "RUH" },
    { name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", iata: "TLV" },
    { name: "Beirut–Rafic Hariri International", city: "Beirut", country: "Lebanon", iata: "BEY" },

    // ---------------- Asia ----------------
    { name: "Beijing Capital International", city: "Beijing", country: "China", iata: "PEK" },
    { name: "Shanghai Pudong International", city: "Shanghai", country: "China", iata: "PVG" },
    { name: "Hong Kong International", city: "Hong Kong", country: "China", iata: "HKG" },
    { name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", iata: "HND" },
    { name: "Narita International Airport", city: "Tokyo", country: "Japan", iata: "NRT" },
    { name: "Incheon International Airport", city: "Seoul", country: "South Korea", iata: "ICN" },
    { name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", iata: "SIN" },
    { name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", iata: "BKK" },
    { name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia", iata: "KUL" },
    { name: "Ninoy Aquino International", city: "Manila", country: "Philippines", iata: "MNL" },
    { name: "Soekarno-Hatta International", city: "Jakarta", country: "Indonesia", iata: "CGK" },
    { name: "Indira Gandhi International", city: "New Delhi", country: "India", iata: "DEL" },
    { name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India", iata: "BOM" },

    // ---------------- Oceania ----------------
    { name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", iata: "SYD" },
    { name: "Melbourne Airport", city: "Melbourne", country: "Australia", iata: "MEL" },
    { name: "Auckland Airport", city: "Auckland", country: "New Zealand", iata: "AKL" },

    // ---------------- Africa (Sub-Saharan) ----------------
    { name: "O.R. Tambo International", city: "Johannesburg", country: "South Africa", iata: "JNB" },
    { name: "Cape Town International", city: "Cape Town", country: "South Africa", iata: "CPT" },
    { name: "Murtala Muhammed International", city: "Lagos", country: "Nigeria", iata: "LOS" },
    { name: "Jomo Kenyatta International", city: "Nairobi", country: "Kenya", iata: "NBO" },
    { name: "Addis Ababa Bole International", city: "Addis Ababa", country: "Ethiopia", iata: "ADD" },
    { name: "Blaise Diagne International", city: "Dakar", country: "Senegal", iata: "DSS" },

    // ---------------- South America ----------------
    { name: "São Paulo–Guarulhos International", city: "São Paulo", country: "Brazil", iata: "GRU" },
    { name: "Rio de Janeiro–Galeão International", city: "Rio de Janeiro", country: "Brazil", iata: "GIG" },
    { name: "Ministro Pistarini International", city: "Buenos Aires", country: "Argentina", iata: "EZE" },
    { name: "El Dorado International", city: "Bogotá", country: "Colombia", iata: "BOG" },
    { name: "Jorge Chávez International", city: "Lima", country: "Peru", iata: "LIM" },
    { name: "Arturo Merino Benítez International", city: "Santiago", country: "Chile", iata: "SCL" }
];


module.exports = AIRPORTS;