const Services = {

    displayName: 'services',
    layout: 'Services',
    layoutIcon: require('../../assets/Images/staticServiceIcon.png'),
    servicesList: [
      {
        fontColor: 'rgba(51, 82, 125, 1)',
        id: 1,
        serviceImage: require('../../assets/Images/staticCalculator.png'),
        status: true,
        subTitle: 'Calculator',
        title: 'Calculator',
        translatedElement: 'Crop',
        translatedTitle: 'calculator',
        visible: false
      },
      {
        fontColor: 'rgba(26, 91, 150, 1)',
        id: 2,
        serviceImage: require('../../assets/Images/staticKnowledgeIcon.png'),
        status: true,
        subTitle: 'Knowledge',
        title: 'Center',
        translatedElement: '',
        translatedTitle: 'products',
        visible: true
      },
      {
        fontColor: 'rgba(235, 90, 65, 1)',
        id: 3,
        serviceImage: require('../../assets/Images/staticRetailerIcon.png'),
        status: true,
        subTitle: 'Retailers',
        title: 'Nearby',
        translatedElement: 'RetailersStatic',
        translatedTitle: 'NearbyStatic',
        visible: true
      },
      {
        fontColor: 'rgba(255, 73, 73, 1)',
        id: 4,
        serviceImage: require('../../assets/Images/staticGeoIcon.png'),
        status: true,
        subTitle: 'Sample',
        title: 'GeoTagging',
        translatedElement: 'SampleStatic',
        translatedTitle: 'GeoTaggingStatic',
        visible: true
      },
      {
        fontColor: 'rgba(26, 164, 228, 1)',
        id: 5,
        serviceImage: require('../../assets/Images/staticCropIcon.png'),
        status: true,
        subTitle: 'Crop',
        title: 'Diagnostic',
        translatedElement: 'Crop',
        translatedTitle: 'DiagnosticStatic',
        visible: false
      },
      {
        fontColor: 'rgba(36, 179, 83, 1)',
        id: 13,
        serviceImage: require('../../assets/Images/staticAdviceIcon.png'),
        status: true,
        subTitle: 'Advice',
        title: 'Agronomy',
        translatedElement: 'AdviceStatic',
        translatedTitle: 'AgronomyStatic',
        visible: true
      },
      {
        fontColor: 'rgba(75, 92, 104, 1)',
        id: 14,
        serviceImage: require('../../assets/Images/staticProductIcon.png'),
        status: true,
        subTitle: 'Product',
        title: 'Scan',
        translatedElement: 'VERIFY',
        translatedTitle: 'PRODUCT',
        visible: true
      },
      {
        fontColor: 'rgba(0, 50, 90, 1)',
        id: 11,
        serviceImage: require('../../assets/Images/staticReferIcon.png'),
        status: true,
        subTitle: 'Refer',
        title: 'Earn Points',
        translatedElement: 'refer',
        translatedTitle: 'Earn_Points',
        visible: true
      }
    ],
    showViewAll: true,
  }
  export default Services;