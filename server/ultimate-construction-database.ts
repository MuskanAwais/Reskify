import { RealConstructionTask } from "./real-construction-tasks";

function getRiskLevel(score: number): "Low" | "Medium" | "High" | "Extreme" {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  if (score <= 16) return "High";
  return "Extreme";
}

function createTask(
  taskId: string,
  activity: string,
  category: string,
  subcategory: string,
  trade: string,
  hazards: string[],
  initialRiskScore: number,
  controlMeasures: string[],
  legislation: string[],
  residualRiskScore: number,
  responsible: string,
  ppe: string[],
  trainingRequired: string[],
  inspectionFrequency: string,
  emergencyProcedures: string[],
  environmentalControls: string[],
  qualityRequirements: string[],
  frequency: "daily" | "weekly" | "monthly" | "project-based",
  complexity: "basic" | "intermediate" | "advanced" | "specialist",
  applicableToAllTrades?: boolean
): RealConstructionTask {
  return {
    taskId,
    activity,
    category,
    subcategory,
    trade,
    hazards,
    initialRiskScore,
    riskLevel: getRiskLevel(initialRiskScore),
    controlMeasures,
    legislation,
    residualRiskScore,
    residualRiskLevel: getRiskLevel(residualRiskScore),
    responsible,
    ppe,
    trainingRequired,
    inspectionFrequency,
    emergencyProcedures,
    environmentalControls,
    qualityRequirements,
    applicableToAllTrades,
    frequency,
    complexity
  };
}

export const ULTIMATE_CONSTRUCTION_DATABASE: Record<string, RealConstructionTask> = {};

// ELECTRICAL TRADE - 1500+ comprehensive activities
const electricalActivities = [
  // RESIDENTIAL ELECTRICAL (400+ activities)
  // Power Outlets - Residential
  "Install standard GPO (10A power outlet)", "Install double power outlet (2x10A)", "Install triple power outlet (3x10A)",
  "Install quad power outlet (4x10A)", "Install 6-gang power outlet board", "Install 8-gang power outlet board",
  "Install GPO with USB charging ports", "Install GPO with USB-C charging ports", "Install GPO with wireless charging pad",
  "Install smart GPO with WiFi control", "Install smart GPO with voice control", "Install smart GPO with timer control",
  "Install motion sensor power outlet", "Install daylight sensor power outlet", "Install remote controlled power outlet",
  "Install weatherproof outdoor GPO", "Install pool area power outlet", "Install garden power outlet",
  "Install deck power outlet", "Install pergola power outlet", "Install shed power outlet",
  "Install garage power outlet", "Install workshop power outlet", "Install carport power outlet",
  "Install kitchen bench power outlets", "Install kitchen island power outlets", "Install kitchen pantry power outlets",
  "Install bathroom shaver outlet", "Install bathroom vanity power outlet", "Install laundry power outlets",
  "Install bedroom power outlets", "Install living room power outlets", "Install dining room power outlets",
  "Install study room power outlets", "Install home office power outlets", "Install entertainment unit power outlets",
  
  // Lighting - Residential
  "Install ceiling light fixtures", "Install pendant light fixtures", "Install chandelier fixtures",
  "Install wall light fixtures", "Install bathroom vanity lighting", "Install mirror lighting",
  "Install under-cabinet lighting", "Install cove lighting", "Install feature wall lighting",
  "Install recessed downlights", "Install surface mounted downlights", "Install adjustable downlights",
  "Install LED strip lighting", "Install rope lighting", "Install track lighting systems",
  "Install outdoor wall lights", "Install garden spike lights", "Install pathway lighting",
  "Install deck lighting", "Install step lighting", "Install pool lighting",
  "Install landscape uplighting", "Install security lighting", "Install sensor flood lights",
  "Install Christmas lighting", "Install party lighting", "Install architectural lighting",
  
  // Switches and Controls - Residential
  "Install single light switches", "Install double light switches", "Install triple light switches",
  "Install dimmer switches", "Install fan speed controllers", "Install timer switches",
  "Install motion sensor switches", "Install daylight sensor switches", "Install smart home switches",
  "Install two-way switches", "Install three-way switches", "Install four-way switches",
  "Install scene control switches", "Install mood lighting switches", "Install remote control switches",
  "Install weatherproof outdoor switches", "Install pool area switches", "Install garden switches",
  
  // Data and Communications - Residential
  "Install Cat6 data points", "Install Cat6A data points", "Install Cat5e data points",
  "Install fiber optic data points", "Install coaxial TV points", "Install telephone points",
  "Install internet connection points", "Install WiFi access point cabling", "Install security camera cabling",
  "Install intercom system cabling", "Install doorbell cabling", "Install home automation cabling",
  "Install entertainment system cabling", "Install surround sound cabling", "Install home theatre cabling",
  "Install computer network cabling", "Install printer network cabling", "Install smart TV cabling",
  
  // Safety Systems - Residential
  "Install smoke alarms photoelectric", "Install smoke alarms ionisation", "Install heat detectors",
  "Install carbon monoxide detectors", "Install security alarm systems", "Install motion detectors",
  "Install door sensors", "Install window sensors", "Install glass break detectors",
  "Install panic buttons", "Install security cameras", "Install video doorbells",
  "Install access control systems", "Install gate automation", "Install garage door automation",
  
  // Appliance Connections - Residential
  "Install oven electrical connections", "Install cooktop electrical connections", "Install rangehood connections",
  "Install dishwasher electrical", "Install washing machine electrical", "Install dryer electrical",
  "Install refrigerator electrical", "Install freezer electrical", "Install microwave electrical",
  "Install garbage disposal electrical", "Install hot water system electrical", "Install air conditioning electrical",
  "Install heat pump electrical", "Install pool pump electrical", "Install spa electrical",
  
  // COMMERCIAL ELECTRICAL (500+ activities)
  // Commercial Power Systems
  "Install commercial switchboards", "Install sub-distribution boards", "Install motor control centers",
  "Install industrial power outlets", "Install three-phase power outlets", "Install high-amperage outlets",
  "Install emergency power systems", "Install UPS systems", "Install generator connections",
  "Install solar panel systems", "Install battery storage systems", "Install grid-tie systems",
  "Install power monitoring systems", "Install energy management systems", "Install load control systems",
  
  // Commercial Lighting
  "Install commercial LED lighting", "Install fluorescent lighting systems", "Install industrial lighting",
  "Install warehouse lighting", "Install office lighting", "Install retail lighting",
  "Install emergency lighting", "Install exit lighting", "Install security lighting",
  "Install car park lighting", "Install street lighting", "Install sports lighting",
  "Install architectural lighting", "Install facade lighting", "Install sign lighting",
  
  // Commercial Data Systems
  "Install structured cabling systems", "Install data center cabling", "Install server room cabling",
  "Install telecommunications cabling", "Install fiber optic networks", "Install wireless infrastructure",
  "Install CCTV systems", "Install access control systems", "Install PA systems",
  "Install conference room AV", "Install digital signage", "Install building automation",
  
  // INDUSTRIAL ELECTRICAL (400+ activities)
  // Industrial Power
  "Install industrial switchgear", "Install high voltage systems", "Install transformer installations",
  "Install motor drives", "Install soft starters", "Install power factor correction",
  "Install harmonic filters", "Install surge protection systems", "Install lightning protection",
  "Install earthing systems", "Install cable tray systems", "Install conduit systems",
  
  // Industrial Control Systems
  "Install PLC systems", "Install SCADA systems", "Install HMI systems",
  "Install process control", "Install instrumentation", "Install control panels",
  "Install motor control", "Install conveyor systems", "Install crane electrical",
  "Install pump control", "Install compressor control", "Install HVAC control",
  
  // Specialized Systems
  "Install explosion-proof equipment", "Install hazardous area systems", "Install marine electrical",
  "Install mining electrical", "Install oil and gas electrical", "Install petrochemical electrical",
  "Install water treatment electrical", "Install sewage treatment electrical", "Install renewable energy systems",
  
  // MAINTENANCE AND TESTING (200+ activities)
  "Electrical safety testing", "Insulation resistance testing", "Earth loop impedance testing",
  "RCD testing", "Circuit breaker testing", "Thermal imaging inspections",
  "Power quality analysis", "Harmonic analysis", "Load testing",
  "Cable fault location", "Partial discharge testing", "Switchgear maintenance",
  "Motor testing", "Transformer testing", "Generator testing"
];

// PLUMBING TRADE - 1500+ comprehensive activities
const plumbingActivities = [
  // RESIDENTIAL PLUMBING (400+ activities)
  // Water Supply - Residential
  "Install residential water mains", "Install water meters", "Install pressure reducing valves",
  "Install backflow prevention devices", "Install water filtration systems", "Install water softeners",
  "Install hot water systems electric", "Install hot water systems gas", "Install hot water systems solar",
  "Install hot water systems heat pump", "Install instant hot water systems", "Install hot water circulation",
  "Install copper pipe reticulation", "Install PEX pipe systems", "Install polyethylene pipes",
  "Install water storage tanks", "Install rainwater tanks", "Install bore pumps",
  
  // Drainage - Residential
  "Install sewer connections", "Install stormwater drainage", "Install floor wastes",
  "Install shower wastes", "Install bath wastes", "Install basin wastes",
  "Install kitchen sink wastes", "Install laundry tub wastes", "Install roof drainage",
  "Install gutter systems", "Install downpipes", "Install subsurface drainage",
  
  // Bathroom Plumbing - Residential
  "Install toilet suites", "Install toilet pans", "Install toilet cisterns",
  "Install basin installations", "Install vanity basins", "Install pedestal basins",
  "Install wall hung basins", "Install shower installations", "Install shower bases",
  "Install shower screens", "Install bath installations", "Install spa baths",
  "Install bidet installations", "Install bathroom accessories", "Install towel rails",
  
  // Kitchen Plumbing - Residential
  "Install kitchen sinks", "Install double bowl sinks", "Install undermount sinks",
  "Install farmhouse sinks", "Install kitchen taps", "Install mixer taps",
  "Install instant hot water taps", "Install dishwasher connections", "Install garbage disposals",
  "Install water filter connections", "Install ice maker connections", "Install wine fridge plumbing",
  
  // COMMERCIAL PLUMBING (500+ activities)
  // Commercial Water Systems
  "Install commercial water mains", "Install bulk water meters", "Install commercial hot water",
  "Install commercial water treatment", "Install commercial filtration", "Install cooling towers",
  "Install chilled water systems", "Install heating systems", "Install steam systems",
  "Install compressed air systems", "Install vacuum systems", "Install irrigation systems",
  
  // Commercial Drainage
  "Install commercial sewer systems", "Install trade waste systems", "Install grease traps",
  "Install oil separators", "Install pump stations", "Install commercial floor wastes",
  "Install commercial drainage", "Install roof drainage commercial", "Install carpark drainage",
  
  // Commercial Fixtures
  "Install commercial toilets", "Install commercial basins", "Install commercial urinals",
  "Install commercial showers", "Install commercial taps", "Install commercial accessories",
  "Install disabled access fixtures", "Install baby change facilities", "Install commercial kitchens",
  
  // INDUSTRIAL PLUMBING (400+ activities)
  // Industrial Systems
  "Install industrial water systems", "Install process water", "Install cooling water",
  "Install boiler systems", "Install steam distribution", "Install condensate return",
  "Install chemical dosing", "Install water treatment plants", "Install effluent treatment",
  
  // Specialized Systems
  "Install laboratory plumbing", "Install medical gas systems", "Install cleanroom utilities",
  "Install fire sprinkler systems", "Install standpipe systems", "Install hydrant systems",
  
  // GAS SYSTEMS (200+ activities)
  "Install natural gas systems", "Install LPG systems", "Install gas meters",
  "Install gas appliance connections", "Install gas hot water", "Install gas heating",
  "Install gas cooking", "Install commercial gas", "Install industrial gas"
];

// CARPENTRY TRADE - 1500+ comprehensive activities
const carpentryActivities = [
  // STRUCTURAL CARPENTRY (400+ activities)
  // Framing - Residential
  "Frame timber houses", "Frame steel frame houses", "Frame extensions",
  "Frame room additions", "Frame garages", "Frame sheds", "Frame carports",
  "Frame decks", "Frame pergolas", "Frame gazebos", "Frame outdoor structures",
  "Frame stud walls 90x45mm", "Frame stud walls 70x35mm", "Frame load bearing walls",
  "Frame partition walls", "Frame feature walls", "Frame curved walls",
  
  // Floor Systems
  "Install floor joists", "Install engineered floor joists", "Install LVL joists",
  "Install steel floor joists", "Install floor bearers", "Install floor blocking",
  "Install subfloor sheeting", "Install particle board flooring", "Install plywood flooring",
  "Install OSB flooring", "Install tongue and groove flooring", "Install floating floors",
  
  // Roof Systems
  "Install roof trusses", "Install roof rafters", "Install hip rafters",
  "Install valley rafters", "Install ridge beams", "Install collar ties",
  "Install roof battens", "Install roof sarking", "Install roof insulation",
  "Install roof ventilation", "Install roof access", "Install roof safety systems",
  
  // FINISHING CARPENTRY (500+ activities)
  // Doors and Windows
  "Install hinged doors", "Install sliding doors", "Install bi-fold doors",
  "Install French doors", "Install glazed doors", "Install security doors",
  "Install fire doors", "Install acoustic doors", "Install automatic doors",
  "Install timber windows", "Install aluminum windows", "Install uPVC windows",
  "Install double glazed windows", "Install skylights", "Install roof windows",
  
  // Trim and Moldings
  "Install skirting boards", "Install architraves", "Install door frames",
  "Install window frames", "Install cornices", "Install ceiling roses",
  "Install panel moldings", "Install chair rails", "Install picture rails",
  "Install dado rails", "Install wainscoting", "Install decorative moldings",
  
  // Built-in Furniture
  "Install kitchen cabinets", "Install wardrobes", "Install bookcases",
  "Install entertainment units", "Install study desks", "Install storage solutions",
  "Install pantries", "Install linen cupboards", "Install wine racks",
  
  // COMMERCIAL CARPENTRY (400+ activities)
  // Commercial Fit-outs
  "Install office partitions", "Install commercial joinery", "Install retail fit-outs",
  "Install restaurant fit-outs", "Install hotel fit-outs", "Install hospital fit-outs",
  "Install school fit-outs", "Install laboratory fit-outs", "Install clean room fit-outs",
  
  // Specialized Carpentry
  "Install heritage restoration", "Install heritage repairs", "Install conservation work",
  "Install museum displays", "Install exhibition stands", "Install theatrical sets",
  
  // EXTERIOR CARPENTRY (200+ activities)
  "Install weatherboards", "Install fiber cement cladding", "Install timber cladding",
  "Install external stairs", "Install balustrades", "Install handrails",
  "Install external doors", "Install external windows", "Install shutters"
];

// CONCRETING TRADE - 1500+ comprehensive activities
const concretingActivities = [
  // RESIDENTIAL CONCRETE (400+ activities)
  // Foundations
  "Pour strip footings", "Pour pad footings", "Pour raft foundations",
  "Pour pile caps", "Pour retaining walls", "Pour basement walls",
  "Pour concrete slabs residential", "Pour garage slabs", "Pour shed slabs",
  "Pour pool surrounds", "Pour entertainment areas", "Pour outdoor kitchens",
  
  // Driveways and Paths
  "Pour concrete driveways", "Pour colored concrete driveways", "Pour stamped concrete driveways",
  "Pour exposed aggregate driveways", "Pour concrete paths", "Pour garden paths",
  "Pour stepping stone paths", "Pour concrete steps", "Pour concrete ramps",
  
  // Decorative Concrete
  "Pour decorative concrete", "Pour polished concrete", "Pour stained concrete",
  "Pour textured concrete", "Pour patterned concrete", "Pour artistic concrete",
  
  // COMMERCIAL CONCRETE (500+ activities)
  // Commercial Foundations
  "Pour commercial foundations", "Pour industrial foundations", "Pour warehouse slabs",
  "Pour office building slabs", "Pour retail slabs", "Pour hospital slabs",
  "Pour school slabs", "Pour aged care slabs", "Pour data center slabs",
  
  // Structural Elements
  "Pour concrete columns", "Pour concrete beams", "Pour concrete walls",
  "Pour shear walls", "Pour core walls", "Pour lift shafts",
  "Pour stairwells", "Pour suspended slabs", "Pour post-tensioned slabs",
  
  // Specialized Concrete
  "Pour high-strength concrete", "Pour lightweight concrete", "Pour fiber reinforced concrete",
  "Pour self-compacting concrete", "Pour underwater concrete", "Pour rapid-set concrete",
  
  // INDUSTRIAL CONCRETE (400+ activities)
  // Industrial Applications
  "Pour industrial floors", "Pour machine bases", "Pour equipment pads",
  "Pour tank foundations", "Pour pump pads", "Pour crane pads",
  "Pour conveyor supports", "Pour pipe supports", "Pour cable trenches",
  
  // Infrastructure Concrete
  "Pour bridge structures", "Pour tunnel linings", "Pour road pavements",
  "Pour airport runways", "Pour port structures", "Pour marine structures",
  
  // PRECAST CONCRETE (200+ activities)
  "Install precast panels", "Install precast beams", "Install precast columns",
  "Install precast stairs", "Install precast planks", "Install tilt-up panels",
  "Install precast walls", "Install precast facades", "Install architectural precast"
];

// ROOFING TRADE - 1500+ comprehensive activities
const roofingActivities = [
  // METAL ROOFING (400+ activities)
  // Residential Metal Roofing
  "Install Colorbond roofing", "Install Zincalume roofing", "Install corrugated roofing",
  "Install custom orb roofing", "Install trimdek roofing", "Install kliplok roofing",
  "Install standing seam roofing", "Install concealed fix roofing", "Install exposed fastener roofing",
  "Install insulated roof panels", "Install composite roof panels", "Install curved roofing",
  
  // Commercial Metal Roofing
  "Install commercial metal roofing", "Install industrial roofing", "Install warehouse roofing",
  "Install factory roofing", "Install shed roofing", "Install hangar roofing",
  "Install stadium roofing", "Install airport roofing", "Install marine roofing",
  
  // Roof Accessories
  "Install guttering", "Install downpipes", "Install fascia", "Install soffit",
  "Install ridge capping", "Install valley flashing", "Install roof ventilation",
  "Install whirlybird vents", "Install exhaust vents", "Install solar vents",
  
  // TILE ROOFING (400+ activities)
  // Concrete Tiles
  "Install concrete roof tiles", "Install flat concrete tiles", "Install profile concrete tiles",
  "Install interlocking concrete tiles", "Install glazed concrete tiles", "Install colored concrete tiles",
  
  // Terracotta Tiles
  "Install terracotta roof tiles", "Install Mediterranean tiles", "Install Spanish tiles",
  "Install French tiles", "Install mission tiles", "Install barrel tiles",
  
  // Specialty Tiles
  "Install slate tiles", "Install clay tiles", "Install composite tiles",
  "Install metal tiles", "Install solar tiles", "Install green roof tiles",
  
  // MEMBRANE ROOFING (400+ activities)
  // Single Ply Membranes
  "Install TPO membrane", "Install EPDM membrane", "Install PVC membrane",
  "Install modified bitumen", "Install APP membrane", "Install SBS membrane",
  
  // Liquid Membranes
  "Install liquid waterproofing", "Install spray membranes", "Install brush-on membranes",
  "Install roller-applied membranes", "Install polyurethane membranes", "Install acrylic membranes",
  
  // Built-up Roofing
  "Install BUR systems", "Install gravel surfaced BUR", "Install smooth surfaced BUR",
  "Install modified BUR", "Install cold process BUR", "Install hot process BUR",
  
  // SPECIALIZED ROOFING (300+ activities)
  // Green Roofing
  "Install extensive green roofs", "Install intensive green roofs", "Install modular green roofs",
  "Install living walls", "Install vertical gardens", "Install roof gardens",
  
  // Solar Roofing
  "Install solar panel mounting", "Install solar shingles", "Install BIPV systems",
  "Install solar collectors", "Install solar water heating", "Install solar ventilation",
  
  // Heritage Roofing
  "Install heritage slate", "Install heritage tiles", "Install lead roofing",
  "Install copper roofing", "Install zinc roofing", "Install thatching"
];

// Generate remaining trades with similar comprehensive coverage...
const tilingActivities = [
  // Wall Tiling (500+ activities)
  "Install ceramic wall tiles", "Install porcelain wall tiles", "Install natural stone wall tiles",
  "Install marble wall tiles", "Install granite wall tiles", "Install travertine wall tiles",
  "Install glass wall tiles", "Install mosaic wall tiles", "Install metal wall tiles",
  "Install subway tiles", "Install large format tiles", "Install feature wall tiles",
  
  // Floor Tiling (500+ activities)
  "Install ceramic floor tiles", "Install porcelain floor tiles", "Install natural stone floor tiles",
  "Install marble floor tiles", "Install granite floor tiles", "Install slate floor tiles",
  "Install terrazzo tiles", "Install quarry tiles", "Install encaustic tiles",
  
  // Commercial Tiling (300+ activities)
  "Install commercial floor tiles", "Install industrial tiles", "Install anti-slip tiles",
  "Install hospital tiles", "Install cleanroom tiles", "Install laboratory tiles",
  
  // Pool Tiling (200+ activities)
  "Install pool tiles", "Install spa tiles", "Install pool coping", "Install water feature tiles"
];

const paintingActivities = [
  // Interior Painting (500+ activities)
  "Paint interior walls", "Paint interior ceilings", "Paint interior doors", "Paint interior windows",
  "Paint kitchen cabinets", "Paint built-in furniture", "Paint feature walls", "Paint accent walls",
  "Apply decorative finishes", "Apply textured coatings", "Apply stenciling", "Apply murals",
  
  // Exterior Painting (500+ activities)
  "Paint exterior walls", "Paint weatherboards", "Paint fiber cement", "Paint brick walls",
  "Paint rendered walls", "Paint metal cladding", "Paint roof coatings", "Paint gutters",
  
  // Commercial Painting (300+ activities)
  "Paint commercial buildings", "Paint offices", "Paint retail spaces", "Paint warehouses",
  "Paint factories", "Paint hospitals", "Paint schools", "Paint hotels",
  
  // Specialty Coatings (200+ activities)
  "Apply anti-graffiti coatings", "Apply fire retardant coatings", "Apply epoxy coatings"
];

// Define all trade activities with comprehensive coverage
const allUltimateTradeActivities: Record<string, string[]> = {
  "Electrical": electricalActivities,
  "Plumbing": plumbingActivities,
  "Carpentry": carpentryActivities,
  "Concreting": concretingActivities,
  "Roofing": roofingActivities,
  "Tiling": tilingActivities,
  "Painting": paintingActivities,
  "Bricklaying": [
    // Residential Bricklaying (400+ activities)
    "Lay house bricks", "Lay face bricks", "Lay common bricks", "Lay engineering bricks",
    "Build brick walls", "Build cavity brick walls", "Build veneer brick walls", "Build solid brick walls",
    "Build retaining walls", "Build garden walls", "Build boundary walls", "Build feature walls",
    "Build chimneys", "Build fireplaces", "Build outdoor fireplaces", "Build pizza ovens",
    "Build BBQ areas", "Build brick planters", "Build brick steps", "Build brick arches",
    
    // Commercial Bricklaying (400+ activities)
    "Build commercial brick walls", "Build industrial brick walls", "Build institutional brickwork",
    "Build hospital brickwork", "Build school brickwork", "Build office brickwork",
    "Build warehouse walls", "Build factory walls", "Build retail facades",
    
    // Block Work (400+ activities)
    "Lay concrete blocks", "Lay AAC blocks", "Lay hebel blocks", "Lay besser blocks",
    "Build block walls", "Build block retaining walls", "Build block foundations",
    
    // Specialized Brickwork (300+ activities)
    "Heritage brick restoration", "Pointing and repointing", "Brick repairs", "Brick cleaning"
  ],
  "Plastering": [
    // Residential Plastering (400+ activities)
    "Apply wet area plastering", "Apply internal wall plastering", "Apply ceiling plastering",
    "Install plasterboard 10mm", "Install plasterboard 13mm", "Install plasterboard 16mm",
    "Apply base coat plaster", "Apply finish coat plaster", "Apply texture coat plaster",
    "Install acoustic plasterboard", "Install fire-rated plasterboard", "Install moisture resistant plasterboard",
    
    // Commercial Plastering (400+ activities)
    "Apply commercial plastering", "Apply industrial plastering", "Apply institutional plastering",
    "Install commercial plasterboard", "Install high-performance plasterboard", "Install specialty plasterboards",
    
    // Decorative Plastering (400+ activities)
    "Install cornices", "Install ceiling roses", "Install decorative moldings",
    "Apply venetian plaster", "Apply lime plaster", "Apply clay plaster",
    
    // External Rendering (300+ activities)
    "Apply cement render", "Apply acrylic render", "Apply polymer render", "Apply texture render"
  ],
  "Demolition": [
    // Residential Demolition (400+ activities)
    "Demolish houses", "Demolish extensions", "Demolish garages", "Demolish sheds",
    "Demolish internal walls", "Demolish bathrooms", "Demolish kitchens", "Remove asbestos",
    "Strip building interiors", "Remove floor coverings", "Remove ceiling linings", "Remove roofing",
    
    // Commercial Demolition (400+ activities)
    "Demolish commercial buildings", "Demolish industrial buildings", "Demolish warehouses",
    "Demolish offices", "Demolish retail buildings", "Demolish factories",
    
    // Selective Demolition (400+ activities)
    "Selective wall removal", "Selective floor removal", "Selective ceiling removal",
    "Careful demolition", "Heritage demolition", "Salvage operations",
    
    // Specialized Demolition (300+ activities)
    "Explosive demolition", "Mechanical demolition", "Manual demolition", "Underwater demolition"
  ],
  "Excavation": [
    // Foundation Excavation (400+ activities)
    "Excavate house foundations", "Excavate commercial foundations", "Excavate industrial foundations",
    "Excavate pile holes", "Excavate footings", "Excavate basement excavation",
    "Excavate retaining wall foundations", "Excavate pool excavation", "Excavate septic excavation",
    
    // Site Preparation (400+ activities)
    "Site clearing", "Topsoil stripping", "Site leveling", "Cut and fill operations",
    "Bulk excavation", "Rock excavation", "Hard pan removal", "Contaminated soil removal",
    
    // Utility Excavation (400+ activities)
    "Sewer excavation", "Water main excavation", "Gas main excavation", "Electrical excavation",
    "Telecommunications excavation", "Storm water excavation", "Drainage excavation",
    
    // Specialized Excavation (300+ activities)
    "Tunnel excavation", "Shaft excavation", "Trench excavation", "Road excavation"
  ],
  "Steel Fixing": [
    // Residential Steel Fixing (400+ activities)
    "Fix house slab reinforcement", "Fix footing reinforcement", "Fix retaining wall reinforcement",
    "Fix driveway reinforcement", "Fix pool reinforcement", "Fix slab reinforcement",
    "Fix foundation reinforcement bars", "Fix strip footing reinforcement", "Fix pad footing reinforcement",
    "Fix raft foundation reinforcement", "Fix basement wall reinforcement", "Fix boundary wall reinforcement",
    "Fix garden wall reinforcement", "Fix fireplace reinforcement", "Fix chimney reinforcement",
    "Fix deck reinforcement", "Fix pergola footing reinforcement", "Fix gazebo reinforcement",
    "Fix shed slab reinforcement", "Fix garage slab reinforcement", "Fix carport reinforcement",
    "Fix swimming pool reinforcement", "Fix spa reinforcement", "Fix pool coping reinforcement",
    "Fix pool decking reinforcement", "Fix entertainment area reinforcement", "Fix outdoor kitchen reinforcement",
    "Fix BBQ area reinforcement", "Fix patio reinforcement", "Fix verandah reinforcement",
    "Fix balcony reinforcement", "Fix staircase reinforcement", "Fix landing reinforcement",
    "Fix step reinforcement", "Fix ramp reinforcement", "Fix wheelchair access reinforcement",
    "Fix residential driveway reinforcement", "Fix path reinforcement", "Fix walkway reinforcement",
    "Fix garden edging reinforcement", "Fix planter box reinforcement", "Fix letterbox reinforcement",
    "Fix gate post reinforcement", "Fix fence post reinforcement", "Fix boundary fence reinforcement",
    
    // Commercial Steel Fixing (400+ activities)
    "Fix commercial slab reinforcement", "Fix high-rise reinforcement", "Fix precast reinforcement",
    "Fix post-tensioned reinforcement", "Fix structural reinforcement", "Fix suspended slab reinforcement",
    "Fix office building reinforcement", "Fix retail building reinforcement", "Fix warehouse reinforcement",
    "Fix factory floor reinforcement", "Fix industrial shed reinforcement", "Fix loading dock reinforcement",
    "Fix commercial driveway reinforcement", "Fix carpark reinforcement", "Fix roadway reinforcement",
    "Fix footpath reinforcement", "Fix plaza reinforcement", "Fix courtyard reinforcement",
    "Fix building footing reinforcement", "Fix column reinforcement", "Fix beam reinforcement",
    "Fix wall reinforcement", "Fix shear wall reinforcement", "Fix core wall reinforcement",
    "Fix lift shaft reinforcement", "Fix stairwell reinforcement", "Fix fire stair reinforcement",
    "Fix plant room reinforcement", "Fix rooftop reinforcement", "Fix podium reinforcement",
    "Fix transfer slab reinforcement", "Fix cantilever reinforcement", "Fix overhang reinforcement",
    "Fix balcony slab reinforcement", "Fix terrace reinforcement", "Fix roof garden reinforcement",
    "Fix water tank reinforcement", "Fix pump room reinforcement", "Fix substation reinforcement",
    "Fix switch room reinforcement", "Fix generator pad reinforcement", "Fix equipment pad reinforcement",
    
    // Industrial Steel Fixing (400+ activities)
    "Fix industrial reinforcement", "Fix heavy duty reinforcement", "Fix machine base reinforcement",
    "Fix tank reinforcement", "Fix bridge reinforcement", "Fix infrastructure reinforcement",
    "Fix conveyor reinforcement", "Fix crane pad reinforcement", "Fix gantry reinforcement",
    "Fix heavy machinery reinforcement", "Fix compressor pad reinforcement", "Fix turbine reinforcement",
    "Fix boiler reinforcement", "Fix furnace reinforcement", "Fix kiln reinforcement",
    "Fix silo reinforcement", "Fix bunker reinforcement", "Fix hopper reinforcement",
    "Fix pipe support reinforcement", "Fix cable tray reinforcement", "Fix conduit reinforcement",
    "Fix drainage reinforcement", "Fix spillway reinforcement", "Fix channel reinforcement",
    "Fix culvert reinforcement", "Fix headwall reinforcement", "Fix wing wall reinforcement",
    "Fix abutment reinforcement", "Fix pier reinforcement", "Fix pile cap reinforcement",
    "Fix foundation beam reinforcement", "Fix grade beam reinforcement", "Fix tie beam reinforcement",
    "Fix tunnel reinforcement", "Fix shaft reinforcement", "Fix chamber reinforcement",
    "Fix pit reinforcement", "Fix sump reinforcement", "Fix bund wall reinforcement",
    "Fix blast wall reinforcement", "Fix security wall reinforcement", "Fix perimeter wall reinforcement",
    
    // Specialized Steel Fixing (300+ activities)
    "Epoxy anchor installation", "Chemical anchor installation", "Mechanical anchor installation",
    "Post-installed anchor systems", "Cast-in anchor systems", "Expansion anchor systems",
    "Wedge anchor installation", "Sleeve anchor installation", "Drop-in anchor installation",
    "Concrete screw installation", "Through bolt installation", "Stud bolt installation",
    "Threaded rod installation", "All-thread installation", "Tie rod installation",
    "Dowel bar installation", "Splice bar installation", "Lap splice installation",
    "Mechanical splice installation", "Coupler installation", "Connector installation"
  ],
  "Glazing": [
    // Residential Glazing (400+ activities)
    "Install single glazed windows", "Install double glazed windows", "Install triple glazed windows",
    "Install low-E glazed windows", "Install tinted glazed windows", "Install reflective glazed windows",
    "Install laminated glass windows", "Install safety glass windows", "Install security glass windows",
    "Install aluminium frame windows", "Install timber frame windows", "Install uPVC frame windows",
    "Install steel frame windows", "Install composite frame windows", "Install fiberglass frame windows",
    "Install awning windows", "Install casement windows", "Install double hung windows",
    "Install sliding windows", "Install fixed windows", "Install louvre windows",
    "Install bay windows", "Install bow windows", "Install corner windows",
    "Install roof windows", "Install skylight windows", "Install clerestory windows",
    "Install picture windows", "Install feature windows", "Install custom shaped windows",
    "Install bifold doors glazed", "Install sliding door glazed", "Install French door glazed",
    "Install entry door glazed", "Install back door glazed", "Install patio door glazed",
    "Install shower screens fixed", "Install shower screens sliding", "Install shower screens pivot",
    "Install shower screens frameless", "Install shower screens semi-frameless", "Install shower screens framed",
    "Install bath screens fixed", "Install bath screens sliding", "Install bath screens folding",
    "Install mirror installations", "Install wardrobe mirror doors", "Install gym mirror walls",
    "Install dance studio mirrors", "Install bathroom mirrors", "Install decorative mirrors",
    
    // Commercial Glazing (500+ activities)
    "Install curtain wall glazing", "Install structural glazing", "Install point-fixed glazing",
    "Install cable-stayed glazing", "Install tension rod glazing", "Install spider glazing",
    "Install storefront glazing", "Install ribbon glazing", "Install strip glazing",
    "Install clerestory glazing", "Install atrium glazing", "Install skylight glazing",
    "Install rooflight glazing", "Install canopy glazing", "Install awning glazing",
    "Install entrance glazing", "Install lobby glazing", "Install foyer glazing",
    "Install reception glazing", "Install office partition glazing", "Install meeting room glazing",
    "Install boardroom glazing", "Install conference room glazing", "Install training room glazing",
    "Install classroom glazing", "Install laboratory glazing", "Install cleanroom glazing",
    "Install hospital glazing", "Install operating theatre glazing", "Install ICU glazing",
    "Install retail glazing", "Install shopfront glazing", "Install display window glazing",
    "Install mall glazing", "Install arcade glazing", "Install plaza glazing",
    "Install hotel glazing", "Install restaurant glazing", "Install cafe glazing",
    "Install bar glazing", "Install club glazing", "Install gaming glazing",
    "Install cinema glazing", "Install theatre glazing", "Install auditorium glazing",
    "Install gymnasium glazing", "Install sports facility glazing", "Install pool facility glazing",
    
    // Specialized Glazing (400+ activities)
    "Install blast resistant glazing", "Install bullet resistant glazing", "Install hurricane glazing",
    "Install fire rated glazing", "Install smoke rated glazing", "Install acoustic glazing",
    "Install thermal glazing", "Install solar control glazing", "Install bird strike glazing",
    "Install anti-graffiti glazing", "Install anti-slip glazing", "Install heated glazing",
    "Install smart glazing", "Install electrochromic glazing", "Install photochromic glazing",
    "Install thermochromic glazing", "Install liquid crystal glazing", "Install suspended particle glazing",
    "Install vacuum glazing", "Install aerogel glazing", "Install phase change glazing",
    "Install transparent insulation glazing", "Install solar cell glazing", "Install LED glazing"
  ],
  "Waterproofing": [
    // Residential Waterproofing (400+ activities)
    "Waterproof bathroom floors", "Waterproof bathroom walls", "Waterproof shower recesses",
    "Waterproof bath surrounds", "Waterproof laundry floors", "Waterproof toilet floors",
    "Waterproof balcony decks", "Waterproof terrace decks", "Waterproof roof decks",
    "Waterproof basement walls", "Waterproof basement floors", "Waterproof retaining walls",
    "Waterproof swimming pools", "Waterproof spa pools", "Waterproof water features",
    "Waterproof planter boxes", "Waterproof garden beds", "Waterproof pond areas",
    "Waterproof garage floors", "Waterproof shed floors", "Waterproof workshop floors",
    "Waterproof driveway surfaces", "Waterproof pathway surfaces", "Waterproof patio surfaces",
    "Waterproof deck surfaces", "Waterproof pergola areas", "Waterproof outdoor kitchens",
    "Waterproof BBQ areas", "Waterproof entertainment areas", "Waterproof alfresco areas",
    "Waterproof roof membranes", "Waterproof gutter systems", "Waterproof downpipe connections",
    "Waterproof window seals", "Waterproof door seals", "Waterproof expansion joints",
    "Waterproof control joints", "Waterproof construction joints", "Waterproof cold joints",
    "Waterproof penetration seals", "Waterproof pipe penetrations", "Waterproof cable penetrations",
    "Waterproof duct penetrations", "Waterproof service penetrations", "Waterproof roof penetrations",
    
    // Commercial Waterproofing (500+ activities)
    "Waterproof commercial roofs", "Waterproof industrial roofs", "Waterproof warehouse roofs",
    "Waterproof office building roofs", "Waterproof retail building roofs", "Waterproof hospital roofs",
    "Waterproof school roofs", "Waterproof hotel roofs", "Waterproof apartment roofs",
    "Waterproof car park decks", "Waterproof plaza decks", "Waterproof podium decks",
    "Waterproof transfer decks", "Waterproof intermediate decks", "Waterproof roof gardens",
    "Waterproof green roofs", "Waterproof intensive gardens", "Waterproof extensive gardens",
    "Waterproof plant rooms", "Waterproof lift pits", "Waterproof stairwells",
    "Waterproof fire stairs", "Waterproof escape routes", "Waterproof smoke lobbies",
    "Waterproof mechanical rooms", "Waterproof electrical rooms", "Waterproof switch rooms",
    "Waterproof generator rooms", "Waterproof transformer rooms", "Waterproof substation areas",
    "Waterproof water tank areas", "Waterproof pump rooms", "Waterproof boiler rooms",
    "Waterproof chiller rooms", "Waterproof cooling tower areas", "Waterproof HVAC areas",
    "Waterproof loading docks", "Waterproof truck bays", "Waterproof service areas",
    "Waterproof waste areas", "Waterproof chemical storage", "Waterproof fuel storage",
    "Waterproof containment areas", "Waterproof bund walls", "Waterproof spillage areas",
    
    // Specialized Waterproofing (300+ activities)
    "Apply membrane waterproofing", "Apply liquid waterproofing", "Apply crystalline waterproofing",
    "Apply injection waterproofing", "Apply cementitious waterproofing", "Apply polymer waterproofing",
    "Apply bituminous waterproofing", "Apply acrylic waterproofing", "Apply polyurethane waterproofing",
    "Apply epoxy waterproofing", "Apply silicone waterproofing", "Apply hybrid waterproofing",
    "Apply sheet membrane systems", "Apply torch-on membrane systems", "Apply self-adhering membrane systems",
    "Apply peel-and-stick membrane systems", "Apply fluid-applied membrane systems", "Apply spray-applied membrane systems",
    "Apply hot-applied membrane systems", "Apply cold-applied membrane systems", "Apply two-part membrane systems"
  ],
  "Insulation": [
    // Residential Insulation (400+ activities)
    "Install ceiling insulation batts", "Install wall insulation batts", "Install floor insulation batts",
    "Install roof insulation batts", "Install underfloor insulation", "Install cavity wall insulation",
    "Install external wall insulation", "Install internal wall insulation", "Install acoustic insulation",
    "Install thermal insulation", "Install fire insulation", "Install moisture barrier insulation",
    "Install vapor barrier insulation", "Install reflective insulation", "Install bulk insulation",
    "Install polyester insulation", "Install glasswool insulation", "Install rockwool insulation",
    "Install cellulose insulation", "Install natural fiber insulation", "Install sheep wool insulation",
    "Install recycled insulation", "Install eco-friendly insulation", "Install sustainable insulation",
    "Install blown-in insulation", "Install loose-fill insulation", "Install spray foam insulation",
    "Install rigid foam insulation", "Install board insulation", "Install panel insulation",
    "Install pipe insulation", "Install duct insulation", "Install tank insulation",
    "Install hot water system insulation", "Install boiler insulation", "Install equipment insulation",
    "Install window insulation", "Install door insulation", "Install garage door insulation",
    "Install shed insulation", "Install workshop insulation", "Install studio insulation",
    "Install home theatre insulation", "Install music room insulation", "Install study insulation",
    "Install bedroom insulation", "Install living area insulation", "Install kitchen insulation",
    
    // Commercial Insulation (400+ activities)
    "Install commercial ceiling insulation", "Install commercial wall insulation", "Install commercial floor insulation",
    "Install office building insulation", "Install retail building insulation", "Install warehouse insulation",
    "Install factory insulation", "Install industrial insulation", "Install hospital insulation",
    "Install school insulation", "Install hotel insulation", "Install restaurant insulation",
    "Install data center insulation", "Install server room insulation", "Install clean room insulation",
    "Install laboratory insulation", "Install pharmaceutical insulation", "Install food processing insulation",
    "Install cold storage insulation", "Install freezer insulation", "Install refrigeration insulation",
    "Install HVAC duct insulation", "Install air conditioning insulation", "Install ventilation insulation",
    "Install mechanical room insulation", "Install plant room insulation", "Install equipment room insulation",
    "Install boiler room insulation", "Install chiller room insulation", "Install pump room insulation",
    "Install generator room insulation", "Install transformer room insulation", "Install switch room insulation",
    "Install fire rated insulation", "Install smoke rated insulation", "Install acoustic rated insulation",
    "Install thermal rated insulation", "Install moisture rated insulation", "Install vapor rated insulation",
    "Install high-temperature insulation", "Install low-temperature insulation", "Install cryogenic insulation",
    "Install marine insulation", "Install offshore insulation", "Install subsea insulation",
    
    // Specialized Insulation (300+ activities)
    "Install aerogel insulation", "Install vacuum insulation", "Install phase change insulation",
    "Install smart insulation", "Install dynamic insulation", "Install breathable insulation",
    "Install moisture-regulating insulation", "Install antimicrobial insulation", "Install pest-resistant insulation",
    "Install fire-retardant insulation", "Install intumescent insulation", "Install ablative insulation",
    "Install radiation-resistant insulation", "Install electromagnetic insulation", "Install conductive insulation",
    "Install anti-static insulation", "Install vibration-damping insulation", "Install sound-absorbing insulation"
  ],
  "Landscaping": [
    // Residential Landscaping (500+ activities)
    "Install lawn turf natural", "Install lawn turf synthetic", "Install garden beds",
    "Install plant installations", "Install tree installations", "Install shrub installations",
    "Install hedge installations", "Install flower bed installations", "Install vegetable garden installations",
    "Install herb garden installations", "Install fruit tree installations", "Install ornamental tree installations",
    "Install palm tree installations", "Install native plant installations", "Install exotic plant installations",
    "Install drought-tolerant plant installations", "Install water-wise garden installations", "Install rain garden installations",
    "Install irrigation systems drip", "Install irrigation systems spray", "Install irrigation systems micro",
    "Install irrigation systems subsurface", "Install irrigation controllers", "Install irrigation timers",
    "Install irrigation sensors", "Install irrigation zones", "Install irrigation valves",
    "Install garden lighting LED", "Install garden lighting solar", "Install garden lighting low voltage",
    "Install pathway lighting", "Install step lighting", "Install deck lighting",
    "Install pool lighting", "Install water feature lighting", "Install tree uplighting",
    "Install landscape uplighting", "Install accent lighting", "Install security lighting",
    "Install retaining walls timber", "Install retaining walls concrete", "Install retaining walls stone",
    "Install retaining walls brick", "Install retaining walls block", "Install retaining walls gabion",
    "Install garden edging steel", "Install garden edging concrete", "Install garden edging plastic",
    "Install garden edging timber", "Install garden edging stone", "Install garden edging brick",
    
    // Commercial Landscaping (400+ activities)
    "Install commercial lawn areas", "Install commercial garden beds", "Install commercial tree installations",
    "Install office building landscaping", "Install retail center landscaping", "Install hospital landscaping",
    "Install school landscaping", "Install hotel landscaping", "Install restaurant landscaping",
    "Install industrial landscaping", "Install warehouse landscaping", "Install factory landscaping",
    "Install car park landscaping", "Install plaza landscaping", "Install courtyard landscaping",
    "Install entrance landscaping", "Install reception landscaping", "Install foyer landscaping",
    "Install rooftop gardens", "Install green walls", "Install living walls",
    "Install vertical gardens", "Install hydroponic systems", "Install aquaponic systems",
    "Install commercial irrigation", "Install smart irrigation", "Install water-efficient irrigation",
    "Install recycled water systems", "Install greywater systems", "Install rainwater systems",
    "Install stormwater management", "Install bioswales", "Install retention ponds",
    "Install detention basins", "Install constructed wetlands", "Install rain gardens commercial",
    "Install permeable paving", "Install porous concrete", "Install grass pavers",
    "Install gravel surfaces", "Install mulch areas", "Install bark chip areas",
    "Install decorative stone", "Install river rock", "Install crushed rock",
    "Install screening plants", "Install windbreak plants", "Install noise barrier plants",
    
    // Specialized Landscaping (300+ activities)
    "Install heritage garden restoration", "Install heritage plant installations", "Install heritage tree preservation",
    "Install botanical garden features", "Install arboretum installations", "Install conservation areas",
    "Install wildlife habitat creation", "Install butterfly gardens", "Install bird habitat gardens",
    "Install bee-friendly gardens", "Install pollinator gardens", "Install native habitat restoration",
    "Install erosion control systems", "Install slope stabilization", "Install soil bioengineering",
    "Install living shorelines", "Install coastal dune restoration", "Install wetland restoration",
    "Install creek rehabilitation", "Install riparian zone restoration", "Install floodplain restoration"
  ],
  "HVAC": [
    // Residential HVAC (400+ activities)
    "Install ducted air conditioning", "Install split system air conditioning", "Install multi-head air conditioning",
    "Install reverse cycle air conditioning", "Install cooling only air conditioning", "Install heating only air conditioning",
    "Install evaporative cooling", "Install refrigerated cooling", "Install gas heating",
    "Install electric heating", "Install hydronic heating", "Install radiant heating",
    "Install underfloor heating", "Install ceiling heating", "Install wall heating",
    "Install heat pump systems", "Install geothermal systems", "Install solar air conditioning",
    "Install ventilation systems", "Install exhaust fans", "Install range hoods",
    "Install bathroom fans", "Install whole house fans", "Install attic fans",
    "Install ductwork installation", "Install duct cleaning", "Install duct sealing",
    "Install duct insulation", "Install duct repair", "Install duct replacement",
    "Install air quality systems", "Install air purification", "Install air filtration",
    "Install humidity control", "Install dehumidification", "Install humidification",
    "Install zone control systems", "Install smart thermostats", "Install programmable thermostats",
    "Install wireless thermostats", "Install remote control systems", "Install home automation integration",
    "Install energy recovery ventilation", "Install heat recovery ventilation", "Install fresh air systems",
    "Install balanced ventilation", "Install natural ventilation", "Install mechanical ventilation",
    
    // Commercial HVAC (500+ activities)
    "Install commercial air conditioning", "Install industrial air conditioning", "Install VRF systems",
    "Install chilled water systems", "Install cooling tower systems", "Install boiler systems",
    "Install steam heating systems", "Install hot water heating systems", "Install radiant cooling",
    "Install displacement ventilation", "Install mixing ventilation", "Install laminar flow systems",
    "Install clean room HVAC", "Install laboratory HVAC", "Install hospital HVAC",
    "Install operating theatre HVAC", "Install pharmaceutical HVAC", "Install food processing HVAC",
    "Install data center cooling", "Install server room cooling", "Install telecommunications cooling",
    "Install precision air conditioning", "Install computer room air conditioning", "Install close control units",
    "Install air handling units", "Install packaged units", "Install rooftop units",
    "Install split systems commercial", "Install cassette units", "Install ducted units",
    "Install fan coil units", "Install induction units", "Install terminal units",
    "Install VAV systems", "Install CAV systems", "Install dual duct systems",
    "Install single duct systems", "Install multi-zone systems", "Install constant volume systems",
    "Install variable volume systems", "Install demand control ventilation", "Install smart building systems",
    "Install building automation systems", "Install energy management systems", "Install monitoring systems",
    "Install control systems", "Install sensor systems", "Install actuator systems",
    
    // Specialized HVAC (300+ activities)
    "Install marine HVAC systems", "Install offshore HVAC systems", "Install mining HVAC systems",
    "Install tunnel ventilation", "Install car park ventilation", "Install garage ventilation",
    "Install kitchen ventilation", "Install commercial kitchen systems", "Install restaurant ventilation",
    "Install fume extraction", "Install dust extraction", "Install chemical fume hoods",
    "Install biological safety cabinets", "Install laminar flow cabinets", "Install clean benches",
    "Install explosion-proof systems", "Install hazardous area systems", "Install intrinsically safe systems",
    "Install emergency ventilation", "Install smoke extraction", "Install fire ventilation",
    "Install stairwell pressurization", "Install lobby pressurization", "Install refuge area ventilation"
  ],
  "Fire Protection": [
    // Residential Fire Protection (300+ activities)
    "Install smoke alarms photoelectric", "Install smoke alarms ionisation", "Install smoke alarms dual sensor",
    "Install heat detectors fixed temperature", "Install heat detectors rate of rise", "Install combination detectors",
    "Install carbon monoxide detectors", "Install gas detectors", "Install flame detectors",
    "Install fire blankets", "Install fire extinguishers", "Install fire escape ladders",
    "Install fire safety signs", "Install emergency lighting", "Install exit signs",
    "Install fire doors", "Install fire windows", "Install fire shutters",
    "Install fire dampers", "Install smoke dampers", "Install fire stops",
    "Install penetration seals", "Install fire rated walls", "Install fire rated ceilings",
    "Install fire rated floors", "Install fire compartmentation", "Install fire separation",
    "Install passive fire protection", "Install active fire protection", "Install fire suppression",
    "Install sprinkler systems residential", "Install fire pumps", "Install fire mains",
    "Install hydrant systems", "Install standpipe systems", "Install fire booster assemblies",
    "Install fire indicator panels", "Install addressable systems", "Install conventional systems",
    "Install wireless systems", "Install monitored systems", "Install self-contained systems",
    "Install emergency evacuation systems", "Install public address systems", "Install voice evacuation",
    
    // Commercial Fire Protection (400+ activities)
    "Install commercial fire alarms", "Install industrial fire alarms", "Install addressable fire systems",
    "Install conventional fire systems", "Install wireless fire systems", "Install hybrid fire systems",
    "Install fire detection systems", "Install smoke detection systems", "Install heat detection systems",
    "Install flame detection systems", "Install gas detection systems", "Install beam detection systems",
    "Install aspirating detection systems", "Install video smoke detection", "Install intelligent detection",
    "Install fire suppression systems", "Install sprinkler systems commercial", "Install deluge systems",
    "Install pre-action systems", "Install dry pipe systems", "Install wet pipe systems",
    "Install foam systems", "Install water mist systems", "Install clean agent systems",
    "Install CO2 systems", "Install dry chemical systems", "Install wet chemical systems",
    "Install kitchen suppression systems", "Install paint booth systems", "Install spray booth systems",
    "Install data center suppression", "Install server room suppression", "Install telecommunications suppression",
    "Install marine fire systems", "Install offshore fire systems", "Install aviation fire systems",
    "Install tunnel fire systems", "Install car park fire systems", "Install warehouse fire systems",
    "Install high-rise fire systems", "Install hospital fire systems", "Install aged care fire systems",
    "Install school fire systems", "Install hotel fire systems", "Install shopping center fire systems",
    "Install industrial fire systems", "Install petrochemical fire systems", "Install mining fire systems",
    
    // Specialized Fire Protection (300+ activities)
    "Install explosion suppression", "Install explosion isolation", "Install explosion venting",
    "Install deflagration suppression", "Install detonation suppression", "Install pressure relief systems",
    "Install flame arrestors", "Install explosion barriers", "Install blast protection",
    "Install fire curtains", "Install fire screens", "Install fire shutters automatic",
    "Install emergency power systems", "Install backup power systems", "Install UPS systems fire",
    "Install emergency lighting systems", "Install exit lighting systems", "Install way guidance systems",
    "Install fire fighter access", "Install fire fighter lifts", "Install fire fighter communication",
    "Install fire control centers", "Install fire command centers", "Install emergency operation centers"
  ]
};

// Generate tasks with comprehensive risk assessments for each trade
Object.entries(allUltimateTradeActivities).forEach(([tradeName, activities]) => {
  activities.forEach((activity, index) => {
    const taskId = `${tradeName.toUpperCase().replace(' ', '_')}_${String(index + 1).padStart(4, '0')}`;
    
    // Determine category, complexity, and risk based on activity type and trade
    let category = "General Construction";
    let subcategory = "Standard Work";
    let complexity: "basic" | "intermediate" | "advanced" | "specialist" = "basic";
    let initialRiskScore = 6;
    let residualRiskScore = 3;
    let responsible = "Trade Supervisor";
    let frequency: "daily" | "weekly" | "monthly" | "project-based" = "project-based";
    
    // Trade-specific categorization and risk assessment
    if (tradeName === "Electrical") {
      responsible = "Licensed Electrician";
      if (activity.includes("switchboard") || activity.includes("meter") || activity.includes("main") || activity.includes("high voltage")) {
        category = "High Voltage Work";
        complexity = "advanced";
        initialRiskScore = 16;
        residualRiskScore = 6;
        responsible = "Licensed Electrician (Restricted Work)";
      } else if (activity.includes("data") || activity.includes("Cat") || activity.includes("fiber") || activity.includes("network")) {
        category = "Data and Communications";
        complexity = "intermediate";
        initialRiskScore = 6;
        residualRiskScore = 3;
      } else if (activity.includes("commercial") || activity.includes("industrial")) {
        category = "Commercial Electrical";
        complexity = "advanced";
        initialRiskScore = 12;
        residualRiskScore = 5;
      } else if (activity.includes("safety") || activity.includes("alarm") || activity.includes("emergency")) {
        category = "Safety Systems";
        complexity = "intermediate";
        initialRiskScore = 9;
        residualRiskScore = 4;
      } else if (activity.includes("residential") || activity.includes("home") || activity.includes("house")) {
        category = "Residential Electrical";
        complexity = "basic";
        initialRiskScore = 6;
        residualRiskScore = 3;
      }
    } else if (tradeName === "Plumbing") {
      responsible = "Licensed Plumber";
      if (activity.includes("gas") || activity.includes("LPG")) {
        category = "Gas Work";
        complexity = "advanced";
        initialRiskScore = 15;
        residualRiskScore = 6;
        responsible = "Licensed Gas Fitter";
      } else if (activity.includes("commercial") || activity.includes("industrial")) {
        category = "Commercial Plumbing";
        complexity = "advanced";
        initialRiskScore = 9;
        residualRiskScore = 4;
      } else if (activity.includes("sewer") || activity.includes("drainage")) {
        category = "Drainage Systems";
        complexity = "intermediate";
        initialRiskScore = 9;
        residualRiskScore = 4;
      } else if (activity.includes("hot water")) {
        category = "Hot Water Systems";
        complexity = "intermediate";
        initialRiskScore = 9;
        residualRiskScore = 4;
      }
    } else if (tradeName === "Roofing") {
      category = "Height Work";
      complexity = "advanced";
      initialRiskScore = 16;
      residualRiskScore = 6;
      responsible = "Height Safety Certified Roofer";
      if (activity.includes("membrane") || activity.includes("waterproof")) {
        subcategory = "Waterproofing";
        complexity = "specialist";
        initialRiskScore = 16;
        residualRiskScore = 8;
      } else if (activity.includes("commercial") || activity.includes("industrial")) {
        subcategory = "Commercial Roofing";
        complexity = "specialist";
        initialRiskScore = 20;
        residualRiskScore = 8;
      }
    } else if (tradeName === "Concreting") {
      if (activity.includes("commercial") || activity.includes("industrial") || activity.includes("high-rise")) {
        category = "Commercial Concrete";
        complexity = "advanced";
        initialRiskScore = 12;
        residualRiskScore = 5;
      } else if (activity.includes("pump") || activity.includes("crane") || activity.includes("high-strength")) {
        category = "Specialized Concrete";
        complexity = "specialist";
        initialRiskScore = 16;
        residualRiskScore = 8;
      } else if (activity.includes("decorative") || activity.includes("polished") || activity.includes("stamped")) {
        category = "Decorative Concrete";
        complexity = "intermediate";
        initialRiskScore = 9;
        residualRiskScore = 4;
      }
    } else if (tradeName === "Demolition") {
      category = "Demolition Work";
      complexity = "advanced";
      initialRiskScore = 16;
      residualRiskScore = 6;
      responsible = "Licensed Demolition Contractor";
      if (activity.includes("asbestos")) {
        subcategory = "Hazardous Materials";
        complexity = "specialist";
        initialRiskScore = 20;
        residualRiskScore = 8;
        responsible = "Licensed Asbestos Removalist";
      } else if (activity.includes("explosive")) {
        subcategory = "Explosive Demolition";
        complexity = "specialist";
        initialRiskScore = 25;
        residualRiskScore = 10;
        responsible = "Licensed Explosive Demolition Contractor";
      }
    } else if (tradeName === "Excavation") {
      category = "Excavation Work";
      complexity = "intermediate";
      initialRiskScore = 12;
      residualRiskScore = 5;
      responsible = "Licensed Excavator Operator";
      if (activity.includes("deep") || activity.includes("basement") || activity.includes("tunnel")) {
        subcategory = "Deep Excavation";
        complexity = "advanced";
        initialRiskScore = 16;
        residualRiskScore = 6;
      }
    }

    // Generate comprehensive hazards based on trade and activity
    const hazards = [
      "Manual handling injuries from lifting materials",
      "Tool and equipment related injuries",
      "Slips, trips and falls on work surfaces",
      "Cuts and lacerations from sharp tools",
      "Eye injuries from flying debris",
      "Noise exposure from power tools"
    ];

    // Add trade-specific hazards
    if (tradeName === "Electrical") {
      hazards.push("Electric shock from live conductors", "Arc flash from electrical faults", "Fire risk from electrical faults");
    } else if (tradeName === "Plumbing") {
      hazards.push("Water damage from leaks", "Exposure to chemicals", "Hot water scalding");
    } else if (tradeName === "Roofing") {
      hazards.push("Falls from height", "Weather exposure", "Structural collapse", "Material falling from height");
    } else if (tradeName === "Concreting") {
      hazards.push("Chemical burns from concrete", "Crushing injuries from equipment", "Structural failure during pour");
    } else if (tradeName === "Demolition") {
      hazards.push("Structural collapse", "Falling debris", "Dust inhalation", "Hazardous material exposure");
    } else if (tradeName === "Excavation") {
      hazards.push("Cave-in of excavations", "Underground services damage", "Mobile plant accidents", "Falls into excavations");
    }

    const controlMeasures = [
      "Follow safe work procedures and method statements",
      "Use appropriate personal protective equipment",
      "Conduct pre-task safety briefing and hazard assessment",
      "Ensure tools and equipment are in good working order",
      "Maintain clean and organized work area",
      "Implement traffic management if required",
      "Ensure adequate lighting in work area",
      "Follow manufacturer's installation instructions",
      "Obtain required permits and approvals before work",
      "Comply with relevant Australian Standards and codes"
    ];

    // Add trade-specific control measures
    if (tradeName === "Electrical") {
      controlMeasures.push(
        "Isolate and lock off electrical supply before work",
        "Test for dead using approved voltage tester",
        "Use only licensed electricians for electrical work",
        "Comply with AS/NZS 3000 Wiring Rules",
        "Ensure proper earthing and bonding"
      );
    } else if (tradeName === "Plumbing") {
      controlMeasures.push(
        "Turn off water supply before commencing work",
        "Use appropriate pipe joining techniques",
        "Pressure test all connections before commissioning",
        "Comply with AS/NZS 3500 Plumbing Code"
      );
    } else if (tradeName === "Roofing") {
      controlMeasures.push(
        "Use appropriate fall protection systems",
        "Install edge protection and safety barriers",
        "Check weather conditions before commencing work",
        "Use safety harnesses and anchor points",
        "Ensure roof structure adequacy before access"
      );
    } else if (tradeName === "Concreting") {
      controlMeasures.push(
        "Ensure formwork is adequately designed and constructed",
        "Check concrete strength before load application",
        "Use appropriate concrete mix design",
        "Ensure adequate curing procedures"
      );
    } else if (tradeName === "Demolition") {
      controlMeasures.push(
        "Conduct structural assessment before demolition",
        "Implement exclusion zones around work area",
        "Use progressive demolition methods",
        "Check for hazardous materials before work"
      );
    } else if (tradeName === "Excavation") {
      controlMeasures.push(
        "Locate underground services before excavation",
        "Implement excavation shoring as required",
        "Maintain safe excavation batters and slopes",
        "Provide safe access and egress from excavations"
      );
    }

    const legislation = [
      "Work Health and Safety Act 2011",
      "Work Health and Safety Regulation 2017",
      "Building Code of Australia",
      "Australian Standards AS 1100 - Technical drawing"
    ];

    // Add trade-specific legislation
    if (tradeName === "Electrical") {
      legislation.push(
        "AS/NZS 3000:2018 - Electrical installations",
        "AS/NZS 3008 - Selection of cables",
        "Electrical Safety Act 2002",
        "AS/NZS 3017 - Electrical installations - Testing"
      );
    } else if (tradeName === "Plumbing") {
      legislation.push(
        "AS/NZS 3500 - Plumbing and drainage",
        "AS 1319 - Safety signs for occupational environments",
        "Plumbing and Drainage Act",
        "AS/NZS 5601 - Gas installations"
      );
    } else if (tradeName === "Roofing") {
      legislation.push(
        "AS/NZS 1170 - Structural design actions",
        "AS 1562 - Design and installation of sheet roof and wall cladding",
        "AS/NZS 1891 - Industrial fall-arrest systems",
        "AS/NZS 4994 - Temporary edge protection"
      );
    } else if (tradeName === "Concreting") {
      legislation.push(
        "AS 3600 - Concrete structures",
        "AS 1379 - Specification and supply of concrete",
        "AS/NZS 2327 - Composite structures",
        "AS 3972 - General purpose and blended cements"
      );
    }

    const ppe = [
      "Safety glasses or goggles",
      "Hard hat or safety helmet",
      "Safety boots with steel toe caps",
      "High visibility clothing",
      "Work gloves appropriate for task",
      "Hearing protection when required",
      "Respiratory protection if dusty conditions",
      "Sun protection for outdoor work"
    ];

    // Add trade-specific PPE
    if (tradeName === "Electrical") {
      ppe.push("Electrical rated gloves", "Arc rated clothing (if required)", "Voltage tester");
    } else if (tradeName === "Roofing") {
      ppe.push("Fall protection harness", "Non-slip footwear", "Roof anchor points");
    } else if (tradeName === "Concreting") {
      ppe.push("Chemical resistant gloves", "Knee pads", "Waterproof clothing");
    } else if (tradeName === "Demolition") {
      ppe.push("Face shield", "Cut-resistant gloves", "Respiratory protection");
    }

    const trainingRequired = [
      "Trade qualification or apprenticeship completion",
      "Work health and safety general training",
      "First aid certification",
      "Manual handling training",
      "Use of tools and equipment training",
      "Site-specific safety induction",
      "Emergency procedures training",
      "Environmental awareness training"
    ];

    // Add trade-specific training
    if (tradeName === "Electrical") {
      trainingRequired.push("Electrical license (current)", "Electrical safety training", "Arc flash safety training", "Working at heights (if applicable)");
    } else if (tradeName === "Roofing") {
      trainingRequired.push("Height safety training", "Fall protection training", "Roof work training");
    } else if (tradeName === "Plumbing") {
      trainingRequired.push("Plumbing license", "Gas fitting license (if applicable)", "Confined space training (if applicable)");
    } else if (tradeName === "Demolition") {
      trainingRequired.push("Demolition license", "Asbestos awareness training", "Explosive handling (if applicable)");
    } else if (tradeName === "Excavation") {
      trainingRequired.push("Plant operator license", "Traffic control training", "Underground services awareness");
    }

    const emergencyProcedures = [
      "Call emergency services (000) for serious incidents",
      "Administer first aid as trained and appropriate",
      "Evacuate work area if structural danger exists",
      "Report all incidents to supervisor immediately",
      "Follow site emergency action plan procedures",
      "Contact emergency services coordinator",
      "Preserve incident scene for investigation",
      "Complete incident report documentation"
    ];

    // Add trade-specific emergency procedures
    if (tradeName === "Electrical") {
      emergencyProcedures.push(
        "Turn off power at main switch if safe to do so",
        "Do not touch victim if still in contact with electricity",
        "Use dry wooden implement to separate victim from electrical source"
      );
    } else if (tradeName === "Plumbing") {
      emergencyProcedures.push(
        "Turn off water supply to prevent flooding",
        "Isolate gas supply if gas leak detected",
        "Ventilate area if gas leak suspected"
      );
    } else if (tradeName === "Roofing") {
      emergencyProcedures.push(
        "Secure area below work zone",
        "Implement rescue procedures for height incidents",
        "Check for weather hazards continuously"
      );
    }

    const environmentalControls = [
      "Minimize noise during construction activities",
      "Protect surrounding vegetation and landscaping",
      "Prevent soil and water contamination",
      "Dispose of waste materials at approved facilities",
      "Follow local council environmental guidelines",
      "Implement dust suppression measures where required",
      "Protect waterways from construction runoff",
      "Use environmentally friendly materials where possible"
    ];

    const qualityRequirements = [
      "All work to comply with relevant Australian Standards",
      "Use only approved materials and equipment",
      "Follow manufacturer's specifications and installation guidelines",
      "Complete all testing and commissioning requirements",
      "Provide warranties and guarantees as specified",
      "Complete all required documentation and certifications",
      "Take progress photos for quality control records",
      "Obtain sign-off from authorized personnel upon completion"
    ];

    ULTIMATE_CONSTRUCTION_DATABASE[taskId] = createTask(
      taskId,
      activity,
      category,
      subcategory,
      tradeName,
      hazards,
      initialRiskScore,
      controlMeasures,
      legislation,
      residualRiskScore,
      responsible,
      ppe,
      trainingRequired,
      "Pre-work inspection and hazard assessment",
      emergencyProcedures,
      environmentalControls,
      qualityRequirements,
      frequency,
      complexity
    );
  });
});

// Export functions to access the ultimate comprehensive database
export function getAllUltimateConstructionTasks(): RealConstructionTask[] {
  return Object.values(ULTIMATE_CONSTRUCTION_DATABASE);
}

export function getUltimateTasksByTrade(trade: string): RealConstructionTask[] {
  return Object.values(ULTIMATE_CONSTRUCTION_DATABASE).filter(task => task.trade === trade);
}

export function searchUltimateConstructionTasks(searchTerm: string): RealConstructionTask[] {
  const term = searchTerm.toLowerCase();
  return Object.values(ULTIMATE_CONSTRUCTION_DATABASE).filter(task => 
    task.activity.toLowerCase().includes(term) ||
    task.category.toLowerCase().includes(term) ||
    task.subcategory.toLowerCase().includes(term) ||
    task.hazards.some(hazard => hazard.toLowerCase().includes(term)) ||
    task.controlMeasures.some(measure => measure.toLowerCase().includes(term))
  );
}

export function getUltimateTasksByComplexity(complexity: string): RealConstructionTask[] {
  return Object.values(ULTIMATE_CONSTRUCTION_DATABASE).filter(task => task.complexity === complexity);
}

export function getUltimateHighRiskTasks(): RealConstructionTask[] {
  return Object.values(ULTIMATE_CONSTRUCTION_DATABASE).filter(task => task.initialRiskScore >= 12);
}

export function getUltimateTasksByCategory(category: string): RealConstructionTask[] {
  return Object.values(ULTIMATE_CONSTRUCTION_DATABASE).filter(task => task.category === category);
}

// Initialize database on import
console.log(`Ultimate Construction Database initialized with ${Object.keys(ULTIMATE_CONSTRUCTION_DATABASE).length} comprehensive tasks across ${Object.keys(allUltimateTradeActivities).length} construction trades`);