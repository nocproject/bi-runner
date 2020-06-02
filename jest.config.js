module.exports = {
    preset: "jest-preset-angular",
    snapshotSerializers: [
        "jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js",
        "jest-preset-angular/build/AngularSnapshotSerializer.js",
        "jest-preset-angular/build/HTMLCommentSerializer.js"
    ],
    moduleNameMapper: {
        "@app/(.*)": "<rootDir>/src/app/$1",
        "@env/(.*)": "<rootDir>/src/environments/$1",
        "@test/(.*)": "<rootDir>/src/app/test-response/$1",
        "\\.(jpg|jpeg|png)$": "<rootDir>/__mocks__/image.js",
        "^@lib/(.*)$": "<rootDir>/src/lib/$1"
    },
    setupFilesAfterEnv: [
        "<rootDir>/src/setupJest.ts"
    ]
}
