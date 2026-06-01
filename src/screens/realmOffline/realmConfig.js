import Realm from 'realm';

const ImageSchema = {
    name: 'Image',
    properties: {
        _id: 'string',
        url: 'string',
        localPath: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const MeetingSchema = {
    name: 'Meeting',
    properties: {
        _id: 'string',
        meetingName: 'string',
        productName: 'string',
        referralMobileNumber: 'string',
        meetingDateandTime: 'string',
        meetingVenue: 'string',
        synced: 'bool',
    },
    primaryKey: '_id',
};

const geoTaggingViewSchema = {
    name: 'GeoTaggingView',
    primaryKey: 'uniquId',
    properties: {
        uniquId: 'string',
        data: 'string',
        isSynced: { type: 'bool', default: false },
    },
};

const KnowledgeCenterSchema = {
    name: 'KnowledgeCenter',
    properties: {
        _id: 'string',
        timestamp: 'date',
        cropsList: 'string',
    },
    primaryKey: '_id',
};

const goldClubKnowledgeCenterSchema = {
    name: 'GoldCludKnowledgeCenter',
    properties: {
        _id: 'string',
        timestamp: 'date',
        cropsList: 'string',
    },
    primaryKey: '_id',
};

const hybridsMasterSchema = {
    name: 'hybridMaster',
    properties: {
        _id: 'string',
        hybridsList: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const FABDetailsSchema = {
    name: 'FABDetails',
    properties: {
        _id: 'string',
        cropId: 'string',
        hybridId: 'string',
        seasonId: 'string',
        details: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const geoTaggingHistorySchema = {
    name: 'GEOTAGGINGHISTORY',
    properties: {
        _id: 'string',
        couponsHistoryList: 'string',
        scanMssg: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const helpDeskRaiseSchema = {
    name: 'helpDeskRaise',
    primaryKey: 'uniquId',
    properties: {
        uniquId: 'string',
        data: 'string',
        isSynced: { type: 'bool', default: false },
    },
};

const YieldCalculatorSchema = {
    name: 'YieldMaster',
    properties: {
        _id: 'string',
        YieldMastersList: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const SeedCalculatorSchema = {
    name: 'SeedMaster',
    properties: {
        _id: 'string',
        SeedMastersList: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const fertilizerCalculatorSchema = {
    name: 'FertilizerMaster',
    properties: {
        _id: 'string',
        FertilizerMastersList: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const fertilizerCalculatorSchema2 = {
    name: 'FertilizerMaster2',
    properties: {
        _id: 'string',
        FertilizerMastersList2: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

const SeedCalSubmitSchema = {
    name: 'SeedCalSubmit',
    primaryKey: '_id',
    properties: {
        _id: 'string',
        data: 'string',
    },
};

const YieldCalSubmitSchema = {
    name: 'YieldCalSubmit',
    primaryKey: '_id',
    properties: {
        _id: 'string',
        data: 'string',
    },
};

const FertilizerCalSubmitSchema = {
    name: 'FertilizerCalSubmit',
    primaryKey: '_id',
    properties: {
        _id: 'string',
        data: 'string',
    },
};

const samadhanSchema = {
    name: 'SAMADHANHISTORY',
    properties: {
        _id: 'string',
        ticketsHistory: 'string',
        timestamp: 'date',
    },
    primaryKey: '_id',
};

// ✅ Realm 20.x — use Realm.open() instead of new Realm()
let realm = null;

export const getRealm = async () => {
    if (realm && !realm.isClosed) {
        return realm;
    }

    realm = await Realm.open({
        schema: [
            ImageSchema,
            MeetingSchema,
            KnowledgeCenterSchema,
            hybridsMasterSchema,
            FABDetailsSchema,
            geoTaggingViewSchema,
            geoTaggingHistorySchema,
            samadhanSchema,
            YieldCalculatorSchema,
            SeedCalculatorSchema,
            SeedCalSubmitSchema,
            YieldCalSubmitSchema,
            FertilizerCalSubmitSchema,
            helpDeskRaiseSchema,
            fertilizerCalculatorSchema,
            fertilizerCalculatorSchema2,
            goldClubKnowledgeCenterSchema,
        ],
        schemaVersion: 2,         // ← bumped from 1 to 2
        migration: (oldRealm, newRealm) => {
            if (oldRealm.schemaVersion < 1) {
                const meetings = newRealm.objects('Meeting');
                for (let i = 0; i < meetings.length; i++) {
                    const meeting = meetings[i];
                    if (meeting.meetingVenue && !meeting.meetingVenue.latitude) {
                        meeting.meetingVenue = JSON.stringify({
                            latitude: 0,
                            longitude: 0,
                        });
                    }
                }
            }
        },
    });

    return realm;
};

export default getRealm;