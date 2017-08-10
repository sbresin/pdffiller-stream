// var fs = require('fs');
var _ = require('lodash')
const dateFormat = require('dateformat')

// only this sequence in FDF header requires char codes
var headerChars = Buffer.from(
  (String.fromCharCode(226)) +
  (String.fromCharCode(227)) +
  (String.fromCharCode(207)) +
  (String.fromCharCode(211)) +
  '\n'
)

var header = Buffer.concat([
  Buffer.from('%FDF-1.2\n'),
  headerChars,
  Buffer.from(
    '1 0 obj \n' +
    '<<\n' +
    '/FDF \n' +
    '<<\n' +
    '/Fields [\n'
  )
])

var footer = Buffer.from(
  ']\n' +
  '>>\n' +
  '>>\n' +
  'endobj \n' +
  'trailer\n' +
  '\n' +
  '<<\n' +
  '/Root 1 0 R\n' +
  '>>\n' +
  '%%EOF\n'
)

var escapeString = function escapeString (value) {
  // format dates
  var out
  if (value instanceof Date) {
    out = dateFormat(value, 'dd.mm.yyyy')
  } else {
    out = value.toString()
  }
  out = out.replace(/\\/g, '\\\\')
  out = out.replace(/\(/g, '\\(')
  out = out.replace(/\)/g, '\\)')
  out = out.toString('utf8')
  return out
}

var concatBody = function concatBody (body, value, name) {
  body = Buffer.concat([
    body,
    Buffer.from(
      '<<\n' +
      '/T (' +
      escapeString(name) +
      ')\n' +
      '/V (' +
      escapeString(value) +
      ')\n' +
      '>>\n'
    )
  ])
  return body
}

exports.createFdf = function (data) {
  var body = Buffer.from([])

  _.mapKeys(data, function (value, name) {
    if (_.isObject(value)) {
      _.mapKeys(value, function (value2, name2) {
        body = concatBody(body, value2, name + '.' + name2)
      })
    } else {
      body = concatBody(body, value, name)
    }
  })

  return Buffer.concat([header, body, footer])
}
