jsdoc ../src/core/* -t node_modules/braintree-jsdoc-template/

rm -rf ../../cables_api/public/jsdoc
mkdir ../../cables_api/public/jsdoc
mv out/* ../../cables_api/public/jsdoc/


