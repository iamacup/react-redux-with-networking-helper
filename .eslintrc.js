module.exports = {
    "env": {
        "es6": true // enables es6 features
    },
    "parser": "babel-eslint", // needed to make babel stuff work properly
    "extends": "airbnb",
    "globals": {
      "__DEV__": true
    },
    "rules": {
      "jsx-a11y/accessible-emoji": 0,
      "import/no-unresolved": 0, //we turn this off here so that we can use 'app/something/ etc.. type imports'
      "global-require": 0,
      "no-underscore-dangle": 0,
      "no-console": 0,
      "react/no-unescaped-entities": 0,
      "max-len": 0,
      "react/forbid-prop-types": 0,
      "no-plusplus": 0,
      "prefer-template": 0,
      "jsx-a11y/href-no-hash": 0,
      "class-methods-use-this": 0,
      "function-paren-newline": 0,
      "react/destructuring-assignment": 0,
      "react/prefer-stateless-function": 0, //this seems to be throwing up false positives in our code base (re the connected components)
      "import/prefer-default-export": 0,
      "react/no-unused-state": 0,
      "no-restricted-syntax": 0,
      "guard-for-in": 0, // it appears that the react-native runtime or whatever does NOT iterate over the prototype which this is suppost to protect against so disabled for now.
      "react/sort-comp": 1,
      "react/no-did-update-set-state": 1,
      "no-useless-constructor": 1,
      "no-use-before-define": 1,
      "react/prop-types": 1,
      "prefer-const": 1,
      "react/no-unused-prop-types": 1,
      "no-unused-vars": 1,
      "prefer-destructuring": 1,
      "jsx-a11y/label-has-for": 1,
      "jsx-a11y/anchor-is-valid": 1,
      "react/no-array-index-key": 1,
      "react/jsx-filename-extension": [
        1,
        {
          "extensions": [
            ".js",
            ".jsx"
          ]
        }
      ],
      "import/no-extraneous-dependencies": [
        "error", {
           "devDependencies": false,
           "optionalDependencies": false,
           "peerDependencies": false,
           "packageDir": "./"
        }
    ]
  }
}
;
