class MockDataGenerator {
    constructor() {
        this.manufacturers = [
            { name: 'Tesla', weight: 0.3 },
            { name: 'Nissan', weight: 0.15 },
            { name: 'BMW', weight: 0.12 },
            { name: 'Ford', weight: 0.1 },
            { name: 'Chevrolet', weight: 0.08 },
            { name: 'Volkswagen', weight: 0.1 },
            { name: 'Toyota', weight: 0.15 }
        ];

        this.vehicleTypes = [
            { name: 'Car', weight: 0.7 },
            { name: 'SUV', weight: 0.2 },
            { name: 'Truck', weight: 0.08 },
            { name: 'Bus', weight: 0.02 }
        ];

        this.regions = ['North America', 'Europe', 'Asia', 'South America', 'Oceania'];
        this.currentYear = new Date().getFullYear();
    }

    generateData(count = 1000) {
        return Array.from({ length: count }, () => this.generateEntry());
    }

    generateEntry() {
        const manufacturer = this.weightedRandom(this.manufacturers);
        const vehicleType = this.weightedRandom(this.vehicleTypes);
        const year = this.randomYear();
        
        return {
            id: crypto.randomUUID(),
            manufacturer: manufacturer.name,
            vehicleType: vehicleType.name,
            model: this.generateModel(manufacturer.name, vehicleType.name),
            year: year,
            region: this.regions[Math.floor(Math.random() * this.regions.length)],
            price: this.generatePrice(manufacturer.name, vehicleType.name, year),
            batteryCapacity: this.generateBatteryCapacity(vehicleType.name),
            range: this.generateRange(vehicleType.name, year)
        };
    }

    weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= item.weight;
            if (random <= 0) return item;
        }
        return items[0];
    }

    randomYear() {
        return Math.floor(2015 + Math.random() * (this.currentYear - 2014));
    }

    generateModel(manufacturer, type) {
        const models = {
            Tesla: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
            Nissan: ['Leaf', 'Ariya', 'e-NV200'],
            BMW: ['i3', 'i4', 'iX', 'iX3'],
            Ford: ['Mustang Mach-E', 'F-150 Lightning', 'E-Transit'],
            Chevrolet: ['Bolt EV', 'Bolt EUV', 'Silverado EV'],
            Volkswagen: ['ID.3', 'ID.4', 'ID.5', 'e-Golf'],
            Toyota: ['bZ4X', 'Proace Electric', 'RAV4 EV']
        };

        const manufacturerModels = models[manufacturer] || ['Generic Model'];
        return manufacturerModels[Math.floor(Math.random() * manufacturerModels.length)];
    }

    generatePrice(manufacturer, type, year) {
        let basePrice = 35000;
        
        // Manufacturer adjustment
        const manufacturerMultiplier = {
            Tesla: 1.4,
            BMW: 1.3,
            Toyota: 0.9,
            Nissan: 0.8
        }[manufacturer] || 1;

        // Type adjustment
        const typeMultiplier = {
            Car: 1,
            SUV: 1.2,
            Truck: 1.4,
            Bus: 2.5
        }[type] || 1;

        // Year adjustment
        const yearMultiplier = 1 + (year - 2015) * 0.03;

        const price = basePrice * manufacturerMultiplier * typeMultiplier * yearMultiplier;
        return Math.round(price / 1000) * 1000; // Round to nearest thousand
    }

    generateBatteryCapacity(type) {
        const baseCapacity = {
            Car: 60,
            SUV: 75,
            Truck: 100,
            Bus: 150
        }[type] || 60;

        return Math.round(baseCapacity * (0.9 + Math.random() * 0.2));
    }

    generateRange(type, year) {
        const baseRange = {
            Car: 250,
            SUV: 220,
            Truck: 200,
            Bus: 150
        }[type] || 200;

        // Newer vehicles tend to have better range
        const yearMultiplier = 1 + (year - 2015) * 0.05;
        
        return Math.round(baseRange * yearMultiplier * (0.9 + Math.random() * 0.2));
    }
}

export default MockDataGenerator; 