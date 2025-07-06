async function pagnation({
  table,
  perPage = 9,
  pageX = 1,
  sortStyle = 'newest',
  criteria = {},
  aggregateExtras = []
}) {
  const skip = (pageX - 1) * perPage;

  const sortMap = {
    newest: { created: -1 },
    oldest: { created: 1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 }
  };
  const sortStage = sortMap[sortStyle] || { created: -1 };

  const pipeline = [
    { $match: criteria },
    ...aggregateExtras,
    { $sort: sortStage },
    { $skip: skip },
    { $limit: perPage }
  ];

  const [results, total] = await Promise.all([
    table.aggregate(pipeline),
    table.countDocuments(criteria)
  ]);

  return {
    table,
    pageX,
    perPage,
    sortStyle,
    results,
    totalPages: Math.ceil(total / perPage),
    totalResults: total
  };
}

module.exports = { pagnation };
