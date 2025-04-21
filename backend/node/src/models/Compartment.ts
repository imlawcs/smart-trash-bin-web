type Compartment = {
    binId: string;
    type: string;
    isFull: boolean;
    sensorId: string;
    updatedAt: Date;
};

interface ICompartment {
    setCompartmentStatus(id: string, isFull: boolean): Promise<void>;
    getCompartmentStatus(id: string): Promise<string>;
    getCompartmentById(id: string): Promise<Compartment>;
    // getCompartmentByName(name: string): Promise<Compartment>;
    getCompartmentBySensorId(sensorId: string): Promise<Compartment>;
}

export {
    Compartment,
    ICompartment
}