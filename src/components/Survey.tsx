'use client'

import { useCallback } from 'react';
import 'survey-core/survey-core.css';
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'

// const SURVEY_ID = 1;

const questionTitles = [
  "活発で、外向的だと思う",
  "他人に不満をもち、もめごとを起こしやすいと思う",
  "しっかりしていて、自分に厳しいと思う",
  "心配性で、うろたえやすいと思う",
  "新しいことが好きで、変わった考えをもつと思う",
  "ひかえめで、おとなしいと思う",
  "人に気をつかう、やさしい人間だと思う",
  "だらしなく、うっかりしていると思う",
  "冷静で、気分が安定していると思う",
  "発想力に欠けた、平凡な人間だと思う"
];

// 5人 × 5枚（1_1.png 〜 5_5.png）としてパスを生成
const imagePaths = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 5 }, (_, j) => `/images-07/${i + 1}_${j + 1}.png`)
).flat();

// ランダムにシャッフル
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const shuffledImages = shuffleArray(imagePaths);

// 各画像ページを生成
// 各画像ページを生成
const imageRatingPages = shuffledImages.map((imagePath, imgIndex) => {
  const fileName = imagePath.split("/").pop()?.replace(".png", "") || `img${imgIndex + 1}`;
  const elements = questionTitles.flatMap((title, qIndex) => [
    {
      type: "html",
      name: `${fileName}_q${qIndex + 1}_image`,
      html: `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${imagePath}" width="300" />
        </div>
      `
    },
    {
      type: "rating",
      name: `${fileName}_q${qIndex + 1}`,
      title,
      isRequired: true,
      rateMin: 1,
      rateMax: 7,
      description: "1: 全く違うと思う　〜　7: 強くそう思う",
      displayMode: "buttons"
    }
  ]);

  return { elements };
});


// SurveyJSON 最終構造
const surveyJson = {
  title: "画像印象評価テスト",
  showProgressBar: "top",
  pages: [
    {
      elements: [
        {
          name: "学籍番号",
          title: "学籍番号",
          type: "text"
        },
        {
          name: "氏名",
          title: "氏名",
          type: "text"
        }
      ]
    },
    ...imageRatingPages.slice(0, 3) 
  ],
  showPreviewBeforeComplete: true,
};


export default function SurveyComponent() {
  const survey = new Model(surveyJson);
  const alertResults = useCallback((sender: Model) => {
    const data = sender.data;

    console.log(data);

    const resultText = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    alert(resultText);
  }, []);

  survey.onComplete.add(alertResults);

  return (
    <Survey model={survey} />
  );
}

// function saveSurveyResults(url: string, json: object) {
//   fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     body: JSON.stringify(json)
//   })
//   .then(response => {
//     if (response.ok) {
//       // Handle success
//     } else {
//       // Handle error
//     }
//   })
//   .catch(error => {
//     // Handle error
//   });
// }