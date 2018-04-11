const algoliaSearch = require('algoliasearch');
const client = algoliaSearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIO_ADMIN_API_KEY)
const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME)

exports.search = (req, res, next) => {
  if(req.query.query) {
    index.search({
      query: req.query.query,
      page: req.query.page
    }, (err, content) => {
      if(content.hits.length === 0) {
        res.json({
          success: true,
          message: 'No results. Sry.',
          status: 200,
        })
      } else {
        res.json({
          success: true,
          message: 'Here is your search result',
          status: 200,
          content: content,
          search_result: req.query.query
        })
      }
    })
  }
}
