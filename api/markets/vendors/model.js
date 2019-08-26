const db = require('../../../db/config');

module.exports = {
  findVendors,
  findVendorsByDate,
}

function findVendors(marketID, query=null) {
  return db('market_vendors as mv')
      .select('*')
      .join('vendors as v', {'mv.vendor_id': 'v.id'})
      .where(builder => {
          builder.where({'mv.market_id':marketID})
          if(!!query) {
              builder.andWhereRaw(`'${query}' <% v.name`)
          }
      })
      .modify(builder => {
          if(!query) {
              return builder.orderBy('v.name', 'v.id')
          } else {
              return builder.orderByRaw(`word_similarity(v.name, '${query}')`)
          }
      })
}

function findVendorsByDate(marketID, date, query=null) {
  return db('market_reserve as mr')
      .select('mr.id','mr.vendor_id','v.name','mr.booth_id', 'mb.name as booth_name', 'mr.paid')
      .join('market_booths as mb', {'mr.booth_id': 'mb.id'})
      .join('vendors as v', {'mr.vendor_id': 'v.id'})
      .where(builder => {
          builder.where({'mr.reserve_date': date, 'mb.market_id':marketID})
          if(!!query) {
              builder.andWhereRaw(`'${query}' <% v.name`)
          }
      })
      .modify(builder => {
          !query
              ? builder.orderBy('v.name', 'v.id')
              : builder.orderByRaw(`word_similarity(v.name, '${query}')`)
      })
}
