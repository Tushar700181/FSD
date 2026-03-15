const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const facultyData = [
    // CSE
    { fullName: "Dr. K. Sathya Babu", department: "CSE", designation: "Professor", email: "ksb@iiitk.ac.in", cabin: "A-143", focusAreas: "Artificial Intelligence", status: "Available", role: "faculty" },
    { fullName: "Dr. Naresh Babu Muppalaneni", department: "CSE", designation: "Associate Professor", email: "nareshbabu@iiitk.ac.in", cabin: "A-133", focusAreas: "Machine Learning, Cryptography, Bioinformatics", status: "Available", role: "faculty" },
    { fullName: "Dr. N. Srinivas Naik", department: "CSE", designation: "Associate Professor & HOD", email: "srinu@iiitk.ac.in", cabin: "A-135", focusAreas: "Big Data, Cloud Computing, Deep Learning, ML, Image Processing", status: "In-Class", role: "faculty" },
    { fullName: "Dr. K. Nagaraju", department: "CSE", designation: "Assistant Professor (Grade I)", email: "knagaraju@iiitk.ac.in", cabin: "A-136", focusAreas: "Theory of Computer Science, Automata Theory, Machine Learning, Deep Learning", status: "Available", role: "faculty" },
    { fullName: "Dr. Anil Kumar R", department: "CSE", designation: "Assistant Professor (Grade I) & Head", email: "anilkumar.r@iiitk.ac.in", cabin: "A-140", focusAreas: "4G, 5G, High Efficiency Wi-Fi networks, IoT and Edge computing, SDN and NFV", status: "Available", role: "faculty" },
    { fullName: "Dr. Shounak Chakraborty", department: "CSE", designation: "Assistant Professor (Grade I)", email: "shounak@iiitk.ac.in", cabin: "A-132", focusAreas: "Artificial neural networks, remote sensing, pattern recognition, image processing", status: "Available", role: "faculty" },
    
    // ECE
    { fullName: "Dr. K. Krishna Naik", department: "ECE", designation: "Associate Professor", email: "krishnanaik@iiitk.ac.in", cabin: "A-173", focusAreas: "Wireless and Mobile Communications", status: "In-Class", role: "faculty" },
    { fullName: "Dr. P. Ranga Babu", department: "ECE", designation: "Associate Professor", email: "p.rangababu@iiitk.ac.in", cabin: "A-177", focusAreas: "Digital VLSI, Multimedia Architectures, Embedded ML", status: "Available", role: "faculty" },
    { fullName: "Dr. Mohamed Asan Basiri M", department: "ECE", designation: "Assistant Professor (Grade-I)", email: "asan@iiitk.ac.in", cabin: "A-179", focusAreas: "VLSI for Signal Processing", status: "Available", role: "faculty" },
    { fullName: "Dr. Eswaramoorthy K. V.", department: "ECE", designation: "Assistant Professor (Grade-I)", email: "eswaramoorthykv@iiitk.ac.in", cabin: "A-174", focusAreas: "Electrochemical biosensors, Biomedical Instrumentation", status: "On-Break", role: "faculty" },
    { fullName: "Dr. Valluri Siva Prasad", department: "ECE", designation: "Assistant Professor (Grade-I) & HOD", email: "vsp@iiitk.ac.in", cabin: "A-178", focusAreas: "Wireless Communication, SDR, MIMO", status: "Available", role: "faculty" },
    { fullName: "Dr. Yaswanth K. N. G. B.", department: "ECE", designation: "Assistant Professor", email: "yaswanthkngb@iiitk.ac.in", cabin: "A-181", focusAreas: "Computational Electromagnetics, RFIC/MMIC Design", status: "Available", role: "faculty" },
    
    // MECH
    { fullName: "Dr. J. Krishnaiah", department: "MECH", designation: "Associate Professor", email: "krishnaiah@iiitk.ac.in", cabin: "B-203", focusAreas: "Data-driven systems, Predictive Modeling", status: "Available", role: "faculty" },
    { fullName: "Dr. Muvvala Pullarao", department: "MECH", designation: "Assistant Professor (Grade-I)", email: "muvvala@iiitk.ac.in", cabin: "B-205", focusAreas: "Thermal Management of Electronics", status: "In-Class", role: "faculty" },
    { fullName: "Dr. Mani Prakash", department: "MECH", designation: "Assistant Professor (Grade-I)", email: "smp@iiitk.ac.in", cabin: "B-204", focusAreas: "Smart Materials, Solid Mechanics", status: "Available", role: "faculty" },
    { fullName: "Dr. Akhtar Khan", department: "MECH", designation: "Assistant Professor (Grade-I) & HoD", email: "akhtar@iiitk.ac.in", cabin: "B-206", focusAreas: "Machine Tool Technology, Optimization", status: "Available", role: "faculty" },
    { fullName: "Dr. Vipindas K", department: "MECH", designation: "Assistant Professor (Grade-I)", email: "vipindas@iiitk.ac.in", cabin: "B-209", focusAreas: "Conventional Machining, Metal Cutting", status: "Available", role: "faculty" },
    { fullName: "Dr. Ravi Kumar Mandava", department: "MECH", designation: "Assistant Professor (Grade-I)", email: "ravikumarr103@iiitk.ac.in", cabin: "B-208", focusAreas: "Robotics, Soft Computing", status: "Available", role: "faculty" },
    { fullName: "Dr. R. Seetharam", department: "MECH", designation: "Assistant Professor (Grade-I)", email: "seetharam@iiitk.ac.in", cabin: "B-215", focusAreas: "Metal Forming, HEA-based Reinforced Nanocomposites", status: "Available", role: "faculty" },

    // DOS
    { fullName: "Dr. Murali", department: "DOS", designation: "Associate Professor", email: "dmurali@iiitk.ac.in", cabin: "C-235", focusAreas: "Computational condensed matter", status: "Available", role: "faculty" },
    { fullName: "Dr. D. Amaranatha Reddy", department: "DOS", designation: "Associate Professor", email: "drreddy@iiitk.ac.in", cabin: "C-241", focusAreas: "Synthesis and characterization of nanoscale materials", status: "In-Class", role: "faculty" },
    { fullName: "Dr. Ravinder Katta", department: "DOS", designation: "Assistant Professor (Grade-I)", email: "ravinder@iiitk.ac.in", cabin: "C-237", focusAreas: "Mathematical Control Theory, Inverse Problems", status: "Available", role: "faculty" },
    { fullName: "Dr. T. Pandiyarajan", department: "DOS", designation: "Assistant Professor (Grade-I) & HOD", email: "pandiyarajan@iiitk.ac.in", cabin: "C-233", focusAreas: "Optical nanomaterials, Thin film fabrication", status: "Available", role: "faculty" },
    { fullName: "Dr. P. V. Prakash Madduri", department: "DOS", designation: "Assistant Professor (Grade-I)", email: "prakash.madduri@iiitk.ac.in", cabin: "C-232", focusAreas: "Magnetism at nanoscale and mesoscale", status: "Available", role: "faculty" },
    { fullName: "Dr. Anirban Majumdar", department: "DOS", designation: "Assistant Professor (Grade-I)", email: "anirban@iiitk.ac.in", cabin: "C-234", focusAreas: "Numerical solutions of PDEs", status: "Available", role: "faculty" },
    { fullName: "Dr. Mani Shankar Pandey", department: "DOS", designation: "Assistant Professor (Grade-I)", email: "mspandey@iiitk.ac.in", cabin: "C-236", focusAreas: "Multiplicative Lie Algebra, Gyrogroup", status: "Available", role: "faculty" }
];

async function seedFaculty() {
    console.log('Using MONGO_URI:', process.env.MONGO_URI);
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const usersCollection = db.collection('users');

        console.log('Cleaning up existing faculty data...');
        await usersCollection.deleteMany({ role: 'faculty' });

        console.log(`Inserting ${facultyData.length} faculty members...`);
        await usersCollection.insertMany(facultyData);

        console.log('Seeding complete! 🚀');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await client.close();
        process.exit();
    }
}

seedFaculty();
