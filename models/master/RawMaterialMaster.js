const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const RawMaterialMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    materialName: { type: String, require: true },
    materialCodeRm: { type: Number },
    materialGroup: { type: String, require: true },
    baseUnitMeasure: { type: String, require: true },
    oldMaterialNumber: { type: String },
    materialState: { type: String },
    materialDescription: { type: String },
    suppliers: { type: Array },
    // mrpOne: {
    //     generalData: {
    //         baseUnit: { type: String },
    //         mrpGroup: { type: String },
    //         purchasingGroup: { type: String },
    //         abcIndicator: { type: String },
    //         plantMaterialStatus: { type: String },
    //         validFrom: { type: String }
    //     },
    //     mrpProcedure: {
    //         mrpType: { type: String },
    //         reOrderPoint: { type: String },
    //         planningTimeFence: { type: String },
    //         planningCycle: { type: String },
    //         mrpController: { type: String }
    //     },
    //     lotSizeData: {
    //         lotSize: { type: String },
    //         minimumLotSize: { type: String },
    //         maximumLotSize: { type: String },
    //         maximumStockLevel: { type: String },
    //         talkTime: { type: String },
    //         roundingProfile: { type: String },
    //         roundingValue: { type: String },
    //         unitOfMeasureGroup: { type: String }
    //     }
    // },
    // mrpTwo: {
    //     procurement: {
    //         procurementType: { type: String },
    //         batchEntry: { type: String },
    //         productStoreLocation: { type: String },
    //         quotaUsage: { type: String },
    //         supplyArea: { type: String },
    //         backFlush: { type: String },
    //         storageLocation: { type: String },
    //         jitDelivery: { type: String },
    //         stockgroup: { type: String },
    //         coProduct: { type: String },
    //         bulkMaterial: { type: String }
    //     },
    //     scheduling: {
    //         inHouseProduction: { type: String },
    //         plannedDeliveryTime: { type: String },
    //         grProcessingTime: { type: String },
    //         planningCalender: { type: String },
    //         schedulingMarginKey: { type: String }
    //     },
    //     netRequirements: {
    //         safetyStock: { type: String },
    //         minSafetyStock: { type: String },
    //         serviceLevel: { type: String },
    //         coverageProfile: { type: String },
    //         safetyTimeInd: { type: String },
    //         safetyTime: { type: String }
    //     }
    // },
    // mrpThree: {
    //     forecast: {
    //         periodIndicator: { type: String },
    //         fiscalYearVariant: { type: String },
    //         splittingIndicator: { type: String }
    //     },
    //     planning: {
    //         stratergyGroup: { type: String },
    //         consumptionMode: { type: String },
    //         fwdConsuptionPer: { type: String },
    //         planningMaterial: { type: String },
    //         planningConvFactor: { type: String }
    //     }
    // },
    // mrpFour: {
    //     bom: {
    //         selectionMethod: { type: String },
    //         individual: { type: String },
    //         componentScrap: { type: String },
    //         requirementsGroup: { type: String },
    //         depRequirements: { type: String }
    //     },
    //     discontinuedParts: {
    //         discontinuedInd: { type: String },
    //         effOut: { type: String },
    //         followUpMaterial: { type: String }
    //     }
    // },
    plantDataOne: {
        generalData: {
            unitOfIssue: { type: String },
            tempConditions: { type: String },
            storageConditions: { type: String },
            containerRequirements: { type: String },
            hazMaterialNumber: { type: String }
        },
        shelfLifeData: {
            maxStoragePeriod: { type: String },
            timeUnit: { type: String },
            minRemainigShelfLife: { type: String },
            totalShelfLife: { type: String },
            periodForSled: { type: String }
        }
    },
    plantDataTwo: {
        weight: {
            containerType: { type: String },
            unitsPerPallet: { type: Number },
            grossWeightPerUnit: { type: Number },
            weightUnit: { type: String },
            netWeight: { type: String },
            volume: { type: String },
            volumeUnit: { type: String },
            dimensionsUnit: { type: String },
            dimensionsL: { type: Number },
            dimensionsW: { type: Number },
            dimensionsH: { type: Number }
        }
    },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
RawMaterialMasterSchema.plugin(AutoIncrement, { inc_field: 'materialCodeRm', inc_amount: '1' });
module.exports = RawMaterialMaster = mongoose.model('RawMaterialMaster', RawMaterialMasterSchema)