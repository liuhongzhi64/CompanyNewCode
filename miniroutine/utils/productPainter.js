export default class LastMayday {
  paletteFixed(params) {
    return ({
      width: '375px',
      height: `${params.imageHeight + 250 }px`,
      views: [
        {
          type: 'image',
          url: `${ params.avatar }`,
          css: {
            borderRadius: '29px',
            width: '58px',
            height: '58px',
            left: '19px',
            top: '18px'
          }
        },
        {
          type: 'text',
          text: `${params.name}  给你推荐`,
          css: {
            fontSize: '18px',
            fontWeight: 'bold',
            textStyle: 'fill',
            left: '93px',
            top: '26px',
            color: '#1A1C22'
          }
        },
        {
          type: 'text',
          text: `${ params.companyName }`,
          css: {
            fontSize: '15px',
            fontWeight: 'normal',
            textStyle: 'fill',
            left: '93px',
            top: '54px',
            color: '#606266'
          }
        },
        {
          type: 'image',
          url: `${ params.image }`,
          css: {
            width: '340px',
            height: `${ params.imageHeight }px`,
            mode: 'aspectFill',
            left: '18px',
            top: '93px'
          }
        },
        {
          type: 'text',
          text: `${ params.productName }`,
          css: {
            fontSize: '18px',
            fontWeight: 'bold',
            textStyle: 'fill',
            left: '18px',
            top: `${ params.imageHeight + 107 }px`,
            color: '#1A1C22'
          }
        },
        {
          type: 'text',
          text: '材质：',
          css: {
            fontSize: '15px',
            fontWeight: 'normal',
            top: `${ params.imageHeight + 140 }px`,
            left: '18px',
            color: '#1A1C22'
          }
        },
        {
          type: 'text',
          text: `${ params.productQuality }`,
          css: {
            fontSize: '15px',
            fontWeight: 'normal',
            top: `${params.imageHeight + 140}px`,
            left: '60px',
            color: '#1A1C22'
          }
        },
        {
          type: 'text',
          text: '型号：',
          css: {
            fontSize: '15px',
            fontWeight: 'normal',
            top: `${ params.imageHeight + 166 }px`,
            left: '18px',
            color: '#1A1C22'
          }
        },
        {
          type: 'text',
          text: `${ params.productModel }`,
          css: {
            fontSize: '15px',
            fontWeight: 'normal',
            top: `${params.imageHeight + 166}px`,
            left: '60px',
            color: '#1A1C22'
          }
        },
        {
          type: 'text',
          text: '￥',
          css: {
            fontSize: '18px',
            fontWeight: 'bold',
            top: `${ params.imageHeight + 207 }px`,
            left: '18px',
            color: '#B74040'
          }
        },
        {
          type: 'text',
          text: `${ params.productPrice }`,
          css: {
            fontSize: '18px',
            fontWeight: 'bold',
            top: `${params.imageHeight + 207}px`,
            left: '36px',
            color: '#B74040'
          }
        },
        {
          type: 'image',
          url: `${ params.qrImage }`,
          css: {
            width: '84px',
            height: '84px',
            top: `${ params.imageHeight + 107 }px`,
            right: '18px'
          }
        },
        {
          type: 'text',
          text: '长按识别小程序码',
          css: {
            fontSize: '10px',
            fontWeight: 'bold',
            top: `${ params.imageHeight + 212 }px`,
            right: '18px',
            color: '#909399'
          }
        },
      ]
    });
  }
  paletteColumn(params) {
    return {
      width: '375px',
      height: `${ params.imageHeight + 360 }px`,
      views: [
        {
          type: 'image',
          url: `${ params.avatar }`,
          css: {
            borderRadius: '58px',
            width: '58px',
            height: '58px',
            left: '19px',
            top: '18px'
          }
        },
        {
          type: 'text',
          text: `${params.name}  给您推荐`,
          css: {
            fontSize: '18px',
            fontWeight: 'bold',
            textStyle: 'fill',
            left: '93px',
            top: '35px'
          }
        },
        {
          type: 'rect',
          css: {
            width: '340px',
            height: `${params.imageHeight + 150 }px`,
            left: '18px',
            top: '93px',
            color: '#FFFFFF',
            borderWidth: '1px',
            borderColor: '#f0f0f0'
          }
        },
        {
          type: 'image',
          url: `${ params.image }`,
          css: {
            width: '340px',
            height: `${ params.imageHeight }px`,
            left: '18px',
            top: '93px'
          }
        },
        {
          type: 'text',
          text: `${ params.productName }`,
          css: {
            width: '375px',
            fontSize: '18px',
            textStyle: 'fill',
            fontWeight: 'bold',
            color: '#000000',
            top: `${ params.imageHeight + 110 }px`,
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          text: `材质：${params.productQuality}`,
          css: {
            width: '375px',
            fontSize: '16px',
            color: '#000000',
            top: `${ params.imageHeight + 140 }px`,
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          text: `型号：${params.productModel}`,
          css: {
            width: '375px',
            fontSize: '16px',
            color: '#000000',
            top: `${ params.imageHeight + 165 }px`,
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          text: `￥${params.productPrice}`,
          css: {
            width: '375px',
            fontSize: '18px',
            color: 'red',
            top: `${ params.imageHeight + 195 }px`,
            textAlign: 'center',
            fontWeight: 'bold'
          }
        },
        {
          type: 'image',
          url: `${params.qrImage}`,
          css: {
            width: '85px',
            height: '85px',
            top: `${ params.imageHeight + 260 }px`,
            left: '18px'
          }
        },
        {
          type: 'text',
          text: '查看商品详情',
          css: {
            fontSize: '14px',
            color: '#909399',
            top: `${ params.imageHeight + 300 }px`,
            left: '110px'
          }
        },
        {
          type: 'text',
          text: '长按图片识别小程序码',
          css: {
            fontSize: '14px',
            color: '#909399',
            top: `${params.imageHeight + 320}px`,
            left: '110px'
          }
        }
      ]
    }
  }
  paletteRow(params) {
    return ({
      width: '375px',
      height: `${ params.imageHeight + 300 }px`,
      views: [
        {
          type: 'rect',
          css: {
            width: '340px',
            height: `${ params.imageHeight + 150 }px`,
            left: '18px',
            top: '18px',
            borderWidth: '1px',
            borderColor: '#f0f0f0',
            color: '#ffffff'
          }
        },
        {
          type: 'image',
          url: `${ params.image }`,
          css: {
            width: '340px',
            height: `${ params.imageHeight }px`,
            top: '18px',
            left: '18px'
          }
        },
        {
          type: 'text',
          text: `${ params.productName }`,
          css: {
            width: '375px',
            fontSize: '18px',
            textStyle: 'fill',
            fontWeight: 'bold',
            color: '#000000',
            top: `${params.imageHeight + 40}px`,
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          text: `材质：${params.productQuality}`,
          css: {
            width: '375px',
            fontSize: '16px',
            color: '#000000',
            top: `${params.imageHeight + 70}px`,
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          text: `型号：${params.productModel }`,
          css: {
            width: '375px',
            fontSize: '16px',
            color: '#000000',
            top: `${params.imageHeight + 95}px`,
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          text: `￥${params.productPrice}`,
          css: {
            width: '375px',
            fontSize: '18px',
            color: 'red',
            top: `${params.imageHeight + 125}px`,
            textAlign: 'center',
            fontWeight: 'bold'
          }
        },
        {
          type: 'image',
          url: `${ params.qrImage }`,
          css: {
            width: '85px',
            height: '85px',
            top: `${params.imageHeight + 190}px`,
            left: '18px'
          }
        },
        {
          type: 'text',
          text: '查看商品详情',
          css: {
            fontSize: '14px',
            color: '#909399',
            top: `${params.imageHeight + 230}px`,
            left: '110px'
          }
        },
        {
          type: 'text',
          text: '长按图片识别小程序码',
          css: {
            fontSize: '14px',
            color: '#909399',
            top: `${params.imageHeight + 250}px`,
            left: '110px'
          }
        }
      ]
    })
  }
  callingcard(params) {
    return {
      width: '375px',
      height: `${ params.imageHeight + 120 }px`,
      views: [
        {
          type: 'image',
          url: params.avatar,
          css: {
            width: '343px',
            height: `${ params.imageHeight }px`,
            mode: 'aspectFill',
            top: '16px',
            left: '16px'
          }
        },
        {
          type: 'text',
          text: params.name,
          css: {
            fontSize: '18px',
            textStyle: 'fill',
            color: '#000000',
            top: `${ params.imageHeight + 45 }px`,
            left: '16px'
          }
        },
        {
          type: 'text',
          text: params.companyName,
          css: {
            fontSize: '18px',
            textStyle: 'fill',
            color: '#000000',
            top: `${params.imageHeight + 80 }px`,
            left: '16px'
          }
        },
        {
          type: 'image',
          url: params.qrImage,
          css: {
            width: '75px',
            height: '75px',
            color: '#000000',
            top: `${ params.imageHeight + 20 }px`,
            right: '16px'
          }
        },
        {
          type: 'text',
          text: '长按识别小程序码',
          css: {
            fontSize: '10px',
            color: '#909399',
            top: `${ params.imageHeight + 100 }px`,
            right: '16px'
          }
        }
      ]
    }
  }
  shareQr(params) {
    return ({
      width: '600px',
      height: '600px',
      views: [
        {
          type: 'image',
          url: params.image,
          css: {
            width: '500px',
            height: '500px',
            top: '50px',
            left: '50px'
          }
        },
        {
          type: 'image',
          url: params.avatar,
          css: {
            width: '220px',
            height: '220px',
            top: '190px',
            left: '190px',
            borderRadius: '110px'
          }
        }
      ]
    })
    
  }
}