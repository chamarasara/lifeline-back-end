const FinishGoodMaster = require('../../models/master/FinishGoodsMaster');
const mongoose = require('mongoose');
//Add new packing material 
exports.finish_good_add_new = (req, res, next) => {
    console.log(req.body)
    const finishGoodMaster = new FinishGoodMaster({
        materialName: req.body.materialName,
        id: mongoose.Types.ObjectId(),
        materialCode: req.body.materialCode,
        materialGroup: req.body.materialGroup,
        baseUnitMeasure: req.body.baseUnitMeasure,
        division: req.body.division,
        materialState: req.body.materialState,
        materialDescription: req.body.materialDescription,
        mrpOne: {
            generalData: {
                baseUnit: req.body.mrpOne.generalData.baseUnit,
                mrpGroup: req.body.mrpOne.generalData.mrpGroup,
                purchasingGroup: req.body.mrpOne.generalData.purchasingGroup,
                abcIndicator: req.body.mrpOne.generalData.abcIndicator,
                plantMaterialStatus: req.body.plantMaterialStatus,
                validFrom: req.body.mrpOne.generalData.validFrom
            },
            mrpProcedure: {
                mrpType: req.body.mrpOne.mrpProcedure.mrpType,
                reOrderPoint: req.body.mrpOne.mrpProcedure.reOrderPoint,
                planningTimeFence: req.body.mrpOne.mrpProcedure.planningTimeFence,
                planningCycle: req.body.mrpOne.mrpProcedure.planningCycle,
                mrpController: req.body.mrpOne.mrpProcedure.mrpController
            },
            lotSizeData: {
                lotSize: req.body.mrpOne.lotSizeData.lotSize,
                minimumLotSize: req.body.mrpOne.lotSizeData.minimumLotSize,
                maximumLotSize: req.body.mrpOne.lotSizeData.maximumLotSize,
                maximumStockLevel: req.body.mrpOne.lotSizeData.maximumStockLevel,
                talkTime: req.body.mrpOne.lotSizeData.talkTime,
                roundingProfile: req.body.mrpOne.lotSizeData.roundingProfile,
                roundingValue: req.body.mrpOne.lotSizeData.roundingValue,
                unitOfMeasureGroup: req.body.mrpOne.lotSizeData.unitOfMeasureGroup
            }
        },
        mrpTwo: {
            procurement: {
                procurementType: req.body.mrpTwo.procurement.procurementType,
                batchEntry: req.body.mrpTwo.procurement.batchEntry,
                productStoreLocation: req.body.mrpTwo.procurement.productStoreLocation,
                quotaUsage: req.body.mrpTwo.procurement.quotaUsage,
                supplyArea: req.body.mrpTwo.procurement.supplyArea,
                backFlush: req.body.mrpTwo.procurement.backFlush,
                storageLocation: req.body.mrpTwo.procurement.storageLocation,
                jitDelivery: req.body.mrpTwo.procurement.jitDelivery,
                stockgroup: req.body.mrpTwo.procurement.stockgroup,
                coProduct: req.body.mrpTwo.procurement.coProduct,
                bulkMaterial: req.body.mrpTwo.procurement.bulkMaterial
            },
            scheduling: {
                inHouseProduction: req.body.mrpTwo.scheduling.inHouseProduction,
                plannedDeliveryTime: req.body.mrpTwo.scheduling.plannedDeliveryTime,
                grProcessingTime: req.body.mrpTwo.scheduling.grProcessingTime,
                planningCalender: req.body.mrpTwo.scheduling.planningCalender,
                schedulingMarginKey: req.body.mrpTwo.scheduling.schedulingMarginKey
            },
            netRequirements: {
                safetyStock: req.body.mrpTwo.netRequirements.safetyStock,
                minSafetyStock: req.body.mrpTwo.netRequirements.minSafetyStock,
                serviceLevel: req.body.mrpTwo.netRequirements.serviceLevel,
                coverageProfile: req.body.mrpTwo.netRequirements.coverageProfile,
                safetyTimeInd: req.body.mrpTwo.netRequirements.safetyTimeInd,
                safetyTime: req.body.mrpTwo.netRequirements.safetyTime
            }
        },
        mrpThree: {
            forecast: {
                periodIndicator: req.body.mrpThree.forecast.periodIndicator,
                fiscalYearVariant: req.body.mrpThree.forecast.fiscalYearVariant,
                splittingIndicator: req.body.mrpThree.forecast.splittingIndicator
            },
            planning: {
                stratergyGroup: req.body.mrpThree.planning.stratergyGroup,
                consumptionMode: req.body.mrpThree.planning.consumptionMode,
                fwdConsuptionPer: req.body.mrpThree.planning.fwdConsuptionPer,
                planningMaterial: req.body.mrpThree.planning.planningMaterial,
                planningConvFactor: req.body.mrpThree.planning.planningConvFactor
            }
        },
        mrpFour: {
            bom: {
                selectionMethod: req.body.mrpFour.bom.selectionMethod,
                individual: req.body.mrpFour.bom.individual,
                componentScrap: req.body.mrpFour.bom.componentScrap,
                requirementsGroup: req.body.mrpFour.bom.requirementsGroup,
                depRequirements: req.body.mrpFour.bom.depRequirements
            },
            discontinuedParts: {
                discontinuedInd: req.body.mrpFour.discontinuedParts.discontinuedInd,
                effOut: req.body.mrpFour.discontinuedParts.effOut,
                followUpMaterial: req.body.mrpFour.discontinuedParts.followUpMaterial
            }
        },
        plantDataOne: {
            generalData: {
                baseUnitPlant: req.body.plantDataOne.generalData.baseUnitPlant,
                unitOfIssue: req.body.plantDataOne.generalData.unitOfIssue,
                tempConditions: req.body.plantDataOne.generalData.tempConditions,
                storageConditions: req.body.plantDataOne.generalData.storageConditions,
                containerRequirements: req.body.plantDataOne.generalData.containerRequirements,
                hazMaterialNumber: req.body.plantDataOne.generalData.hazMaterialNumber,
                ccPhysInvInd: req.body.plantDataOne.generalData.ccPhysInvInd,
                grSlips: req.body.plantDataOne.generalData.grSlips,
                labelType: req.body.plantDataOne.generalData.labelType,
                labelFrom: req.body.plantDataOne.generalData.labelFrom
            },
            shelfLifeData: {
                maxStoragePeriod: req.body.plantDataOne.shelfLifeData.maxStoragePeriod,
                timeUnit: req.body.plantDataOne.shelfLifeData.timeUnit,
                minRemainigShelfLife: req.body.plantDataOne.shelfLifeData.minRemainigShelfLife,
                totalShelfLife: req.body.plantDataOne.shelfLifeData.totalShelfLife,
                periodForSled: req.body.plantDataOne.shelfLifeData.periodForSled,
                storagePercentage: req.body.plantDataOne.shelfLifeData.storagePercentage
            }
        },
        plantDataTwo: {
            weight: {
                grossWeight: req.body.plantDataTwo.weight.grossWeight,
                weightUnit: req.body.plantDataTwo.weight.weightUnit,
                netWeight: req.body.plantDataTwo.weight.netWeight,
                volume: req.body.plantDataTwo.weight.volume,
                volumeUnit: req.body.plantDataTwo.weight.volumeUnit,
                dimensions: req.body.plantDataTwo.weight.dimensions
            },
            generalParameters: {
                seriolNumberProfile: req.body.plantDataTwo.generalParameters.seriolNumberProfile,
                profitCenter: req.body.plantDataTwo.generalParameters.profitCenter,
                logHandlingGroup: req.body.plantDataTwo.generalParameters.logHandlingGroup,
                distributorProfile: req.body.plantDataTwo.generalParameters.distributorProfile,
                stockDetermGroup: req.body.plantDataTwo.generalParameters.stockDetermGroup,
                serLevel: req.body.plantDataTwo.generalParameters.serLevel
            }
        }

    });
    finishGoodMaster.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        finishGoodMaster: finishGoodMaster
    });
}
//Get all raw materials
exports.finish_good_get_all = (req, res, next) => {
    FinishGoodMaster.find()
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
exports.finish_good_get_one = (req, res, next) => {
    id = req.params._id;
    FinishGoodMaster.findById(id)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: "No valid ID found" })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}
//Update raw material
exports.update_finish_good = (req, res, next) => {

    const id = req.params._id;
    console.log("req body", req.body);
    const updateOps = {};
    // for (const ops in req.body) {
    //     updateOps[ops.propName] = ops.value;
    // }
    FinishGoodMaster.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            FinishGoodMaster.findById(id)
                .then(docs => {
                    console.log("docs****", docs)
                    res.status(200).json(docs);
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
}

//Delete raw material
exports.delete_finish_good = (req, res, next) => {
    const id = req.params._id;
    FinishGoodMaster.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}