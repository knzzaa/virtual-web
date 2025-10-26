import {
  db,
  materials,
  exams,
  examQuestions,
  missions,
  missionQuestions,
} from "./index";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(missionQuestions);
    await db.delete(missions);
    await db.delete(examQuestions);
    await db.delete(exams);
    await db.delete(materials);

    // Seed Materials
    console.log("📚 Seeding materials...");
    const materialsData = [
      {
        slug: "grammar-essentials",
        title: "Grammar Essentials: Tenses and Sentence Structure",
        description:
          "Learn about basic sentence structure, Simple Present, Simple Past, and Present Perfect tenses",
        contentHtml: `
<div class="video-container">
  <iframe width="800" height="450" src="https://www.youtube.com/embed/2BgjygvZ_vE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
<div class="content-card">
  <h3 class="section-header">Basic Sentence Structure</h3>
  <p class="content-text">General pattern: <b><i>Subject + Verb + Object</i></b></p>
  <p class="content-text">Example: <i>"She writes a report every week."</i><br /><i>(Subject = She, Verb = writes, Object = a report)</i></p>
  <ol class="content-list">
    <li>
      <h4 class="subsection-header">Simple Present Tense</h4>
      <p class="content-text">Used to express habits, general facts, or routines.</p>
      <div class="example-box">
        <p><i>"He studies every night."</i></p>
        <p><i>"Water boils at 100°C."</i></p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">Simple Past Tense</h4>
      <p class="content-text">Used to express events that are completed in the past (with a clear time).</p>
      <div class="example-box">
        <p><i>"We visited the library yesterday."</i></p>
        <p><i>"She finished her report last night."</i></p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">Present Perfect Tense</h4>
      <p class="content-text">Shows a connection between the past and present. Used when the time of the event is not specific, and the result is still relevant now.</p>
      <div class="example-box">
        <p><b>Formula: <i>Subject + have/has + past participle</i></b></p>
      </div>
      <div class="example-box">
        <p><i>"I have studied English since high school."</i></p>
        <p><i>"She has just finished her assignment."</i></p>
      </div>
      <p class="content-text"><b>When to use:</b></p>
      <ul class="content-list">
        <li>Action that started in the past and is still ongoing:<br /><i>"He has worked at ITB since 2022."</i></li>
        <li>Action that just finished:<br /><i>"I have just eaten lunch."</i></li>
        <li>Repeated action at an unspecified time:<br /><i>"We have visited Bali several times."</i></li>
        <li>Time is not important:<br /><i>"She has read 'War and Peace'."</i></li>
      </ul>
    </li>
  </ol>
</div>
<div class="content-card">
  <h3 class="section-header">Comparison with Simple Past:</h3>
  <div class="example-box">
    <p><i>"I have seen that movie."</i> → time not specified</p>
    <p><i>"I saw that movie yesterday."</i> → specific time mentioned</p>
  </div>
</div>`,
        orderIndex: 1,
      },
      {
        slug: "academic-vocabulary",
        title: "Academic Vocabulary and Collocations",
        description:
          "Master common academic collocations and essential vocabulary for academic writing",
        contentHtml: `
<div class="video-container">
  <iframe width="800" height="450" src="https://www.youtube.com/embed/9346yn9-8uc?si=ahGXUeQcc21zJTSI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
<div class="content-card">
  <h3 class="section-header">What are Collocations?</h3>
  <p class="content-text"><b>Collocations</b> are words that are often used together in English. They sound natural to native speakers and using them correctly makes your English more fluent and natural.</p>
  <p class="content-text">For example: We say <i>"make a decision"</i> not <i>"do a decision"</i>, or <i>"strong coffee"</i> not <i>"powerful coffee"</i>.</p>
  <h4 class="subsection-header">Common Academic Collocations</h4>
  <ol class="content-list">
    <li>
      <h4 class="subsection-header">Verb + Noun Collocations</h4>
      <div class="example-box">
        <p>• <b>Conduct</b> research</p>
        <p>• <b>Reach</b> a conclusion</p>
        <p>• <b>Make</b> an argument</p>
        <p>• <b>Draw</b> a distinction</p>
        <p>• <b>Gather</b> evidence</p>
        <p>• <b>Present</b> findings</p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">Adjective + Noun Collocations</h4>
      <div class="example-box">
        <p>• <b>Significant</b> impact</p>
        <p>• <b>Strong</b> evidence</p>
        <p>• <b>Clear</b> indication</p>
        <p>• <b>Key</b> factor</p>
        <p>• <b>Major</b> contribution</p>
        <p>• <b>Valid</b> argument</p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">Verb + Preposition Collocations</h4>
      <div class="example-box">
        <p>• <b>Consist of</b> - "The study consists of three parts."</p>
        <p>• <b>Focus on</b> - "This research focuses on environmental issues."</p>
        <p>• <b>Refer to</b> - "The author refers to previous studies."</p>
        <p>• <b>Result in</b> - "The experiment resulted in unexpected findings."</p>
        <p>• <b>Contribute to</b> - "This contributes to our understanding."</p>
      </div>
    </li>
  </ol>
</div>
<div class="content-card">
  <h3 class="section-header">Essential Academic Vocabulary</h3>
  <div class="example-box">
    <h4 class="subsection-header">Words for Analysis:</h4>
    <p class="content-text"><b>analyze</b>, <b>evaluate</b>, <b>assess</b>, <b>examine</b>, <b>investigate</b>, <b>explore</b></p>
    <h4 class="subsection-header">Words for Expressing Ideas:</h4>
    <p class="content-text"><b>suggest</b>, <b>indicate</b>, <b>demonstrate</b>, <b>illustrate</b>, <b>propose</b>, <b>argue</b></p>
    <h4 class="subsection-header">Words for Describing Relationships:</h4>
    <p class="content-text"><b>consequently</b>, <b>furthermore</b>, <b>however</b>, <b>nevertheless</b>, <b>moreover</b>, <b>therefore</b></p>
  </div>
</div>
<div class="content-card">
  <h3 class="section-header">Practice Tips</h3>
  <ul class="content-list">
    <li><b>Read academic texts</b> regularly to see collocations in context</li>
    <li><b>Keep a collocation notebook</b> and group them by topic</li>
    <li><b>Practice using collocations</b> in your own writing</li>
    <li><b>Use online collocation dictionaries</b> to check word combinations</li>
  </ul>
</div>`,
        orderIndex: 2,
      },
      {
        slug: "reading-comprehension",
        title: "Reading Comprehension Strategies",
        description:
          "Learn effective strategies for understanding and analyzing academic texts",
        contentHtml: `
<div class="video-container">
  <iframe width="800" height="450" src="https://www.youtube.com/embed/Fc4aCd3vrSg?si=GquYjnPugWR_7WQm" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
<div class="content-card">
  <h3 class="section-header">Essential Reading Strategies</h3>
  <p class="content-text">Effective reading comprehension requires a combination of strategies that help you understand, analyze, and retain information from texts. Here are the key strategies:</p>
  <ol class="content-list">
    <li>
      <h4 class="subsection-header">Pre-Reading Strategies</h4>
      <p class="content-text">Prepare yourself before diving into the text</p>
      <div class="example-box">
        <p><b>Preview the Text:</b> Look at titles, headings, images, and graphs to get an overview</p>
        <p><b>Activate Prior Knowledge:</b> Think about what you already know about the topic</p>
        <p><b>Set a Purpose:</b> Ask yourself why you are reading this text</p>
        <p><b>Make Predictions:</b> Guess what the text will be about based on the title and headings</p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">During-Reading Strategies</h4>
      <p class="content-text">Active strategies to use while reading</p>
      <div class="example-box">
        <p><b>Annotate:</b> Highlight key information, underline main ideas, and write notes in margins</p>
        <p><b>Ask Questions:</b> Continuously ask yourself questions about the content</p>
        <p><b>Visualize:</b> Create mental images of what you're reading</p>
        <p><b>Monitor Comprehension:</b> Stop periodically to check if you understand what you've read</p>
        <p><b>Identify Main Ideas:</b> Distinguish between main points and supporting details</p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">Post-Reading Strategies</h4>
      <p class="content-text">Consolidate your understanding after reading</p>
      <div class="example-box">
        <p><b>Summarize:</b> Write a brief summary of the main points in your own words</p>
        <p><b>Review:</b> Go back over key sections and your notes</p>
        <p><b>Connect:</b> Link new information to what you already know</p>
        <p><b>Evaluate:</b> Assess the author's arguments and evidence</p>
      </div>
    </li>
  </ol>
</div>
<div class="content-card">
  <h3 class="section-header">Speed Reading Techniques</h3>
  <div>
    <h4 class="subsection-header">1. Skimming</h4>
    <p class="content-text">Quickly reading to get the general idea. Useful for previewing or reviewing material.</p>
  </div>
  <div>
    <h4 class="subsection-header">2. Scanning</h4>
    <p class="content-text">Looking for specific information or keywords. Useful when you know exactly what you're looking for.</p>
  </div>
  <div>
    <h4 class="subsection-header">3. Intensive Reading</h4>
    <p class="content-text">Careful, detailed reading for complete understanding. Necessary for complex academic texts.</p>
  </div>
</div>
<div class="content-card">
  <h3 class="section-header">Tips for Better Comprehension</h3>
  <div class="tips-box">
    <ul class="content-list">
      <li><b>Read regularly</b> to build your vocabulary and reading stamina</li>
      <li><b>Read in a quiet environment</b> to minimize distractions</li>
      <li><b>Take breaks</b> when reading long texts to maintain concentration</li>
      <li><b>Discuss what you read</b> with others to deepen understanding</li>
      <li><b>Keep a reading journal</b> to track insights and questions</li>
      <li><b>Use context clues</b> to figure out unfamiliar words</li>
    </ul>
  </div>
</div>`,
        orderIndex: 3,
      },
      {
        slug: "academic-writing",
        title: "Academic Writing and Presentation Skills",
        description:
          "Master the structure and style of academic writing and effective presentation techniques",
        contentHtml: `
<div class="video-container">
  <iframe width="800" height="450" src="https://www.youtube.com/embed/vtIzMaLkCaM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
<div class="content-card">
  <h3 class="section-header">Academic Writing Structure</h3>
  <p class="content-text">Academic writing requires a clear, organized structure and formal style. Here's a comprehensive guide to help you write effective academic papers:</p>
  <ol class="content-list">
    <li>
      <h4 class="subsection-header">Introduction</h4>
      <p class="content-text">Set the stage for your paper</p>
      <div class="example-box">
        <p><b>Hook:</b> Start with an interesting fact, question, or statement</p>
        <p><b>Background:</b> Provide context for your topic</p>
        <p><b>Thesis Statement:</b> Clearly state your main argument or purpose</p>
        <p><b>Preview:</b> Outline what the paper will cover</p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">Body Paragraphs</h4>
      <p class="content-text">Develop your arguments with evidence</p>
      <div class="example-box">
        <p><b>Topic Sentence:</b> State the main idea of the paragraph</p>
        <p><b>Evidence:</b> Provide facts, statistics, quotes, or examples</p>
        <p><b>Analysis:</b> Explain how the evidence supports your argument</p>
        <p><b>Transition:</b> Connect to the next paragraph smoothly</p>
      </div>
    </li>
    <li>
      <h4 class="subsection-header">Conclusion</h4>
      <p class="content-text">Wrap up your arguments effectively</p>
      <div class="example-box">
        <p><b>Restate Thesis:</b> Remind readers of your main argument</p>
        <p><b>Summarize Key Points:</b> Briefly recap your main arguments</p>
        <p><b>Implications:</b> Discuss the significance of your findings</p>
        <p><b>Call to Action/Future Research:</b> Suggest next steps or areas for further study</p>
      </div>
    </li>
  </ol>
</div>
<div class="content-card">
  <h3 class="section-header">Academic Writing Style</h3>
  <div class="tips-box">
    <h4 class="subsection-header">Key Principles:</h4>
    <ul class="content-list">
      <li><b>Formal Tone:</b> Avoid contractions, slang, and personal opinions</li>
      <li><b>Objective Language:</b> Use third person and evidence-based arguments</li>
      <li><b>Clear and Precise:</b> Use specific, concrete language</li>
      <li><b>Logical Flow:</b> Use transition words to connect ideas</li>
      <li><b>Proper Citations:</b> Always credit your sources</li>
    </ul>
  </div>
  <div class="example-box">
    <h4 class="subsection-header">Common Mistakes to Avoid:</h4>
    <ul class="content-list">
      <li>Using informal language or personal pronouns excessively</li>
      <li>Writing overly long or complex sentences</li>
      <li>Plagiarizing or not citing sources properly</li>
      <li>Making broad generalizations without evidence</li>
      <li>Poor paragraph organization</li>
    </ul>
  </div>
</div>
<div class="content-card">
  <h3 class="section-header">Presentation Skills</h3>
  <p class="content-text">Effective presentations require careful preparation and confident delivery:</p>
  <div>
    <h4 class="subsection-header">1. Preparation</h4>
    <div class="example-box">
      <p>• Know your audience and adjust content accordingly</p>
      <p>• Create clear, visual slides with minimal text</p>
      <p>• Practice your presentation multiple times</p>
      <p>• Prepare for potential questions</p>
    </div>
  </div>
  <div>
    <h4 class="subsection-header">2. Delivery</h4>
    <div class="example-box">
      <p>• Make eye contact with your audience</p>
      <p>• Speak clearly and at a moderate pace</p>
      <p>• Use gestures and body language effectively</p>
      <p>• Vary your tone to maintain interest</p>
    </div>
  </div>
  <div>
    <h4 class="subsection-header">3. Slide Design Tips</h4>
    <div class="example-box">
      <p>• Use the 6x6 rule: max 6 bullet points, 6 words each</p>
      <p>• Choose readable fonts (min 24pt for body text)</p>
      <p>• Use high-quality images and diagrams</p>
      <p>• Maintain consistent design throughout</p>
      <p>• Use color strategically for emphasis</p>
    </div>
  </div>
</div>
<div class="content-card">
  <h3 class="section-header">Useful Academic Phrases</h3>
  <div class="example-box">
    <div>
      <p><b>Introducing Arguments:</b></p>
      <p class="content-text">"This paper argues that...", "The main purpose of this study is to...", "It can be argued that..."</p>
    </div>
    <div>
      <p><b>Presenting Evidence:</b></p>
      <p class="content-text">"According to...", "Research shows that...", "The data suggests that..."</p>
    </div>
    <div>
      <p><b>Contrasting Ideas:</b></p>
      <p class="content-text">"However...", "On the other hand...", "In contrast...", "Nevertheless..."</p>
    </div>
    <div>
      <p><b>Concluding:</b></p>
      <p class="content-text">"In conclusion...", "To summarize...", "In summary...", "Therefore..."</p>
    </div>
  </div>
</div>`,
        orderIndex: 4,
      },
    ];

    const insertedMaterials = await db
      .insert(materials)
      .values(materialsData)
      .returning();
    console.log(`✅ Inserted ${insertedMaterials.length} materials`);

    // Seed Exams
    console.log("📝 Seeding exams...");
    const examsData = [
      {
        slug: "grammar-tenses-quiz",
        title: "Grammar & Tenses Quiz",
        description:
          "Complete the sentences using the correct form of Present Perfect tense",
        htmlContent: null,
        orderIndex: 1,
      },
      {
        slug: "vocabulary-assessment",
        title: "Vocabulary Assessment",
        description:
          "Choose the correct word or phrase to complete each sentence",
        htmlContent: null,
        orderIndex: 2,
      },
      {
        slug: "reading-comprehension-test",
        title: "Reading Comprehension Test",
        description: "Read the passage and answer the questions below",
        htmlContent: `<div class="reading-passage">
  <h3>The Benefits of Learning English</h3>
  <p>English has become the global language of business, science, and technology. In today's interconnected world, proficiency in English opens doors to countless opportunities. Whether you're seeking career advancement, planning to study abroad, or simply wanting to connect with people from different cultures, English serves as a vital communication tool.</p>
  <p>Research shows that learning a second language, particularly English, has cognitive benefits beyond communication. It enhances problem-solving skills, improves memory, and increases mental flexibility. Bilingual individuals often demonstrate better multitasking abilities and show improved concentration compared to monolingual speakers.</p>
  <p>Moreover, English proficiency significantly impacts earning potential. Studies indicate that employees with strong English skills can earn up to 30% more than their counterparts with limited English proficiency. As businesses continue to expand globally, the demand for English-speaking professionals continues to grow across all industries.</p>
</div>`,
        orderIndex: 3,
      },
      {
        slug: "writing-skills-evaluation",
        title: "Writing Skills Evaluation",
        description: "Test your knowledge of academic writing principles",
        htmlContent: null,
        orderIndex: 4,
      },
    ];

    const insertedExams = await db.insert(exams).values(examsData).returning();
    console.log(`✅ Inserted ${insertedExams.length} exams`);

    // Seed Exam Questions
    console.log("❓ Seeding exam questions...");

    // Exam 1: Grammar & Tenses Quiz (text input questions)
    const exam1Questions = [
      {
        examId: insertedExams[0].id,
        questionNumber: 1,
        questionType: "text",
        questionText:
          "Sophie and I (know) _______ each other since we were at school together.",
        correctAnswer: "have known",
        options: null,
        correctOptionIndex: null,
        orderIndex: 1,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 2,
        questionType: "text",
        questionText: "I (play) _______ tennis since I was eight years old.",
        correctAnswer: "have played",
        options: null,
        correctOptionIndex: null,
        orderIndex: 2,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 3,
        questionType: "text",
        questionText: "Alain (be) _______ in hospital three times this year.",
        correctAnswer: "has been",
        options: null,
        correctOptionIndex: null,
        orderIndex: 3,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 4,
        questionType: "text",
        questionText:
          "I (want) _______ to be an actor for as long as I can remember.",
        correctAnswer: "have wanted",
        options: null,
        correctOptionIndex: null,
        orderIndex: 4,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 5,
        questionType: "text",
        questionText:
          "My uncle (smoke) _______ 40 cigarettes a day for 40 years – and he's a doctor!",
        correctAnswer: "has smoked",
        options: null,
        correctOptionIndex: null,
        orderIndex: 5,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 6,
        questionType: "text",
        questionText: "You (have) _______ that suit for more than ten years!",
        correctAnswer: "have had",
        options: null,
        correctOptionIndex: null,
        orderIndex: 6,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 7,
        questionType: "text",
        questionText:
          "Since he finished university, my brother (work) _______ in five different countries.",
        correctAnswer: "has worked",
        options: null,
        correctOptionIndex: null,
        orderIndex: 7,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 8,
        questionType: "text",
        questionText:
          "Zerrin (watch) _______ that TV programme every week since it started.",
        correctAnswer: "has watched",
        options: null,
        correctOptionIndex: null,
        orderIndex: 8,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 9,
        questionType: "text",
        questionText:
          "I (never like) _______ bananas. I think they're horrible!",
        correctAnswer: "have never liked",
        options: null,
        correctOptionIndex: null,
        orderIndex: 9,
      },
      {
        examId: insertedExams[0].id,
        questionNumber: 10,
        questionType: "text",
        questionText:
          "What's the most interesting city you (ever visit) _______ ?",
        correctAnswer: "have ever visited",
        options: null,
        correctOptionIndex: null,
        orderIndex: 10,
      },
    ];

    // Exam 2: Vocabulary Assessment (radio questions)
    const exam2Questions = [
      {
        examId: insertedExams[1].id,
        questionNumber: 1,
        questionType: "radio",
        questionText:
          "The research ________ strong evidence supporting the theory.",
        correctAnswer: null,
        options: ["provides", "does", "makes", "gives"],
        correctOptionIndex: 0,
        orderIndex: 1,
      },
      {
        examId: insertedExams[1].id,
        questionNumber: 2,
        questionType: "radio",
        questionText: "We need to ________ a conclusion based on the data.",
        correctAnswer: null,
        options: ["draw", "make", "do", "take"],
        correctOptionIndex: 0,
        orderIndex: 2,
      },
      {
        examId: insertedExams[1].id,
        questionNumber: 3,
        questionType: "radio",
        questionText: "The findings ________ that further research is needed.",
        correctAnswer: null,
        options: ["suggest", "tell", "say", "speak"],
        correctOptionIndex: 0,
        orderIndex: 3,
      },
      {
        examId: insertedExams[1].id,
        questionNumber: 4,
        questionType: "radio",
        questionText:
          "________, the experiment was successful despite initial difficulties.",
        correctAnswer: null,
        options: ["Nevertheless", "Because", "So", "But"],
        correctOptionIndex: 0,
        orderIndex: 4,
      },
      {
        examId: insertedExams[1].id,
        questionNumber: 5,
        questionType: "radio",
        questionText: "The study ________ of three main parts.",
        correctAnswer: null,
        options: ["consists", "composes", "contains", "includes"],
        correctOptionIndex: 0,
        orderIndex: 5,
      },
      {
        examId: insertedExams[1].id,
        questionNumber: 6,
        questionType: "radio",
        questionText:
          "This theory has had a ________ impact on modern science.",
        correctAnswer: null,
        options: ["significant", "big", "large", "great"],
        correctOptionIndex: 0,
        orderIndex: 6,
      },
      {
        examId: insertedExams[1].id,
        questionNumber: 7,
        questionType: "radio",
        questionText:
          "The author ________ previous studies in the introduction.",
        correctAnswer: null,
        options: ["refers to", "talks about", "mentions to", "speaks to"],
        correctOptionIndex: 0,
        orderIndex: 7,
      },
      {
        examId: insertedExams[1].id,
        questionNumber: 8,
        questionType: "radio",
        questionText:
          "We must ________ the results carefully before making decisions.",
        correctAnswer: null,
        options: ["analyze", "look", "see", "watch"],
        correctOptionIndex: 0,
        orderIndex: 8,
      },
    ];

    // Exam 3: Reading Comprehension Test (radio questions)
    const exam3Questions = [
      {
        examId: insertedExams[2].id,
        questionNumber: 1,
        questionType: "radio",
        questionText: "According to the passage, English is described as:",
        correctAnswer: null,
        options: [
          "A local language",
          "The global language of business, science, and technology",
          "Only useful for travel",
          "A dying language",
        ],
        correctOptionIndex: 1,
        orderIndex: 1,
      },
      {
        examId: insertedExams[2].id,
        questionNumber: 2,
        questionType: "radio",
        questionText: "What cognitive benefits does learning English provide?",
        correctAnswer: null,
        options: [
          "Only communication skills",
          "Enhanced problem-solving, memory, and mental flexibility",
          "Just vocabulary improvement",
          "No cognitive benefits",
        ],
        correctOptionIndex: 1,
        orderIndex: 2,
      },
      {
        examId: insertedExams[2].id,
        questionNumber: 3,
        questionType: "radio",
        questionText: "Bilingual individuals are mentioned as having better:",
        correctAnswer: null,
        options: [
          "Singing abilities",
          "Multitasking abilities and concentration",
          "Physical fitness",
          "Cooking skills",
        ],
        correctOptionIndex: 1,
        orderIndex: 3,
      },
      {
        examId: insertedExams[2].id,
        questionNumber: 4,
        questionType: "radio",
        questionText:
          "According to studies, employees with strong English skills can earn:",
        correctAnswer: null,
        options: [
          "The same as others",
          "10% less",
          "Up to 30% more",
          "50% more",
        ],
        correctOptionIndex: 2,
        orderIndex: 4,
      },
      {
        examId: insertedExams[2].id,
        questionNumber: 5,
        questionType: "radio",
        questionText: "The main purpose of this passage is to:",
        correctAnswer: null,
        options: [
          "Criticize learning English",
          "Explain the benefits of learning English",
          "Discuss English grammar",
          "Compare English with other languages",
        ],
        correctOptionIndex: 1,
        orderIndex: 5,
      },
    ];

    // Exam 4: Writing Skills Evaluation (radio questions)
    const exam4Questions = [
      {
        examId: insertedExams[3].id,
        questionNumber: 1,
        questionType: "radio",
        questionText:
          "Which of the following is NOT a component of a good introduction?",
        correctAnswer: null,
        options: [
          "Hook",
          "Thesis statement",
          "Detailed conclusion",
          "Background information",
        ],
        correctOptionIndex: 2,
        orderIndex: 1,
      },
      {
        examId: insertedExams[3].id,
        questionNumber: 2,
        questionType: "radio",
        questionText: "What is the purpose of a topic sentence in a paragraph?",
        correctAnswer: null,
        options: [
          "To conclude the paragraph",
          "To state the main idea of the paragraph",
          "To provide evidence",
          "To list all the details",
        ],
        correctOptionIndex: 1,
        orderIndex: 2,
      },
      {
        examId: insertedExams[3].id,
        questionNumber: 3,
        questionType: "radio",
        questionText: "Which transition word indicates contrast?",
        correctAnswer: null,
        options: ["Furthermore", "However", "Therefore", "Moreover"],
        correctOptionIndex: 1,
        orderIndex: 3,
      },
      {
        examId: insertedExams[3].id,
        questionNumber: 4,
        questionType: "radio",
        questionText: "In academic writing, you should:",
        correctAnswer: null,
        options: [
          "Use informal language",
          "Include personal opinions without evidence",
          "Maintain a formal and objective tone",
          "Avoid citing sources",
        ],
        correctOptionIndex: 2,
        orderIndex: 4,
      },
      {
        examId: insertedExams[3].id,
        questionNumber: 5,
        questionType: "radio",
        questionText: "What should a conclusion do?",
        correctAnswer: null,
        options: [
          "Introduce new arguments",
          "Restate the thesis and summarize key points",
          "Repeat the introduction word for word",
          "Focus only on one minor detail",
        ],
        correctOptionIndex: 1,
        orderIndex: 5,
      },
      {
        examId: insertedExams[3].id,
        questionNumber: 6,
        questionType: "radio",
        questionText: "Which is an example of plagiarism?",
        correctAnswer: null,
        options: [
          "Citing all your sources properly",
          "Using someone else's ideas without crediting them",
          "Paraphrasing with citations",
          "Quoting with quotation marks and citations",
        ],
        correctOptionIndex: 1,
        orderIndex: 6,
      },
      {
        examId: insertedExams[3].id,
        questionNumber: 7,
        questionType: "radio",
        questionText: "The 6x6 rule for presentation slides suggests:",
        correctAnswer: null,
        options: [
          "Maximum 6 bullet points with 6 words each",
          "6 slides per presentation",
          "6 colors per slide",
          "6 minutes per presentation",
        ],
        correctOptionIndex: 0,
        orderIndex: 7,
      },
    ];

    const allExamQuestions = [
      ...exam1Questions,
      ...exam2Questions,
      ...exam3Questions,
      ...exam4Questions,
    ];

    const insertedExamQuestions = await db
      .insert(examQuestions)
      .values(allExamQuestions)
      .returning();
    console.log(`✅ Inserted ${insertedExamQuestions.length} exam questions`);

    // Seed Missions
    console.log("🎯 Seeding missions...");
    const missionsData = [
      {
        slug: "animals-vocabulary",
        title: "Animals Vocabulary Challenge",
        description: "Test your knowledge of common animal names in English",
      },
      {
        slug: "food-vocabulary",
        title: "Food & Drinks Vocabulary",
        description: "Identify different types of food and beverages",
      },
      {
        slug: "everyday-objects",
        title: "Everyday Objects Quiz",
        description: "Recognize common objects we use in daily life",
      },
      {
        slug: "colors-and-shapes",
        title: "Colors Vocabulary Quiz",
        description:
          "Identify and match different colors with their English names",
      },
      {
        slug: "transportation-quiz",
        title: "Transportation Vocabulary",
        description: "Learn vocabulary related to different modes of transport",
      },
    ];

    const insertedMissions = await db
      .insert(missions)
      .values(missionsData)
      .returning();
    console.log(`✅ Inserted ${insertedMissions.length} missions`);

    // Seed Mission Questions
    console.log("🎮 Seeding mission questions...");

    // Mission 1: Animals Vocabulary
    const mission1Questions = [
      {
        missionId: insertedMissions[0].id,
        questionNumber: 1,
        questionText: 'Which one is a "Dog"?',
        options: [
          "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop", // Dog - golden retriever
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop", // Cat - tabby
          "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop", // Rabbit - white bunny
        ],
        correctOptionIndex: 0,
        orderIndex: 1,
      },
      {
        missionId: insertedMissions[0].id,
        questionNumber: 2,
        questionText: 'Which one is a "Cat"?',
        options: [
          "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop", // Horse - brown
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop", // Cat - orange/ginger
          "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop", // Dog - golden retriever
        ],
        correctOptionIndex: 1,
        orderIndex: 2,
      },
      {
        missionId: insertedMissions[0].id,
        questionNumber: 3,
        questionText: 'Which one is an "Elephant"?',
        options: [
          "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400&h=400&fit=crop", // Giraffe
          "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=400&fit=crop", // Elephant
          "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=400&fit=crop", // Tiger
        ],
        correctOptionIndex: 1,
        orderIndex: 3,
      },
      {
        missionId: insertedMissions[0].id,
        questionNumber: 4,
        questionText: 'Which one is a "Lion"?',
        options: [
          "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=400&fit=crop", // Tiger
          "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=400&fit=crop", // Lion - male with mane
          "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=400&fit=crop", // Leopard - spotted
        ],
        correctOptionIndex: 1,
        orderIndex: 4,
      },
      {
        missionId: insertedMissions[0].id,
        questionNumber: 5,
        questionText: 'Which one is a "Butterfly"?',
        options: [
          "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400&h=400&fit=crop", // Giraffe
          "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=400&fit=crop", // Tiger
          "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop", // Butterfly - monarch CAT+ BUTTERFLY
        ],
        correctOptionIndex: 2,
        orderIndex: 5,
      },
    ];

    // Mission 2: Food & Drinks
    const mission2Questions = [
      {
        missionId: insertedMissions[1].id,
        questionNumber: 1,
        questionText: 'Which one is "Pizza"?',
        options: [
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", // Pizza - pepperoni
          "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop", // Burger - cheeseburger
          "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop", // Sandwich
        ],
        correctOptionIndex: 0,
        orderIndex: 1,
      },
      {
        missionId: insertedMissions[1].id,
        questionNumber: 2,
        questionText: 'Which one is "Coffee"?',
        options: [
          "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop", // Tea - cup of tea
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop", // Coffee - cup with latte art
          "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop", // Orange juice
        ],
        correctOptionIndex: 1,
        orderIndex: 2,
      },
      {
        missionId: insertedMissions[1].id,
        questionNumber: 3,
        questionText: 'Which one is an "Apple"?',
        options: [
          "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400&h=400&fit=crop", // Orange fruit
          "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop", // Banana
          "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&h=400&fit=crop", // Apple - red apples
        ],
        correctOptionIndex: 2,
        orderIndex: 3,
      },
      {
        missionId: insertedMissions[1].id,
        questionNumber: 4,
        questionText: 'Which one is a "Burger"?',
        options: [
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", // Pizza - pepperoni
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop", // Burger - classic hamburger
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop", // Ice cream - cone
        ],
        correctOptionIndex: 1,
        orderIndex: 4,
      },
      {
        missionId: insertedMissions[1].id,
        questionNumber: 5,
        questionText: 'Which one is "Ice Cream"?',
        options: [
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop", // Ice cream - cone
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", // Cake - slice
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop", // Donut - glazed
        ],
        correctOptionIndex: 0,
        orderIndex: 5,
      },
    ];

    // Mission 3: Everyday Objects
    const mission3Questions = [
      {
        missionId: insertedMissions[2].id,
        questionNumber: 1,
        questionText: 'Which one is a "Book"?',
        options: [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop", // Watch - wristwatch
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop", // Book - stack of books THIS IS A BOOK ALSO
          "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop", // Pen
        ],
        correctOptionIndex: 1,
        orderIndex: 1,
      },
      {
        missionId: insertedMissions[2].id,
        questionNumber: 2,
        questionText: 'Which one is a "Clock"?',
        options: [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop", // Watch - wristwatch
          "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop", // Clock - wall clock
          "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop", // Shoes - sneakers
        ],
        correctOptionIndex: 1,
        orderIndex: 2,
      },
      {
        missionId: insertedMissions[2].id,
        questionNumber: 3,
        questionText: 'Which one is a "Laptop"?',
        options: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop", // Tablet - iPad
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop", // Phone - smartphone
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop", // Laptop - MacBook
        ],
        correctOptionIndex: 2,
        orderIndex: 3,
      },
      {
        missionId: insertedMissions[2].id,
        questionNumber: 4,
        questionText: 'Which one is a "Chair"?',
        options: [
          "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop", // Desk - wooden desk
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop", // Sofa - living room sofa
          "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop", // Chair - modern chair
        ],
        correctOptionIndex: 2,
        orderIndex: 4,
      },
      {
        missionId: insertedMissions[2].id,
        questionNumber: 5,
        questionText: 'Which one is a "Backpack"?',
        options: [
          "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&h=400&fit=crop", // Suitcase - travel luggage
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop", // Handbag - leather bag
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", // Backpack - travel backpack
        ],
        correctOptionIndex: 2,
        orderIndex: 5,
      },
    ];

    // Mission 4: Colors and Shapes
    const mission4Questions = [
      {
        missionId: insertedMissions[3].id,
        questionNumber: 1,
        questionText: 'Which color is "Red"?',
        options: [
          "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400&h=400&fit=crop", // Red roses
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop", // Blue sky
          "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop", // Green leaves
        ],
        correctOptionIndex: 0,
        orderIndex: 1,
      },
      {
        missionId: insertedMissions[3].id,
        questionNumber: 2,
        questionText: 'Which color is "Blue"?',
        options: [
          "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&h=400&fit=crop", // Yellow sunflower
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop", // Blue sky
          "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400&h=400&fit=crop", // Red roses
        ],
        correctOptionIndex: 1,
        orderIndex: 2,
      },
      {
        missionId: insertedMissions[3].id,
        questionNumber: 3,
        questionText: 'Which color is "Yellow"?',
        options: [
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop", // Blue sky
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=400&fit=crop", // Green leaves
          "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&h=400&fit=crop", // Yellow sunflower
        ],
        correctOptionIndex: 2,
        orderIndex: 3,
      },
      {
        missionId: insertedMissions[3].id,
        questionNumber: 4,
        questionText: 'Which color is "Green"?',
        options: [
          "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400&h=400&fit=crop", // Red roses
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=400&fit=crop", // Green leaves
          "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&h=400&fit=crop", // Yellow sunflower
        ],
        correctOptionIndex: 1,
        orderIndex: 4,
      },
      {
        missionId: insertedMissions[3].id,
        questionNumber: 5,
        questionText: 'Which one is "Purple"?',
        options: [
          "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&h=400&fit=crop", // Purple lavender flowers
          "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&h=400&fit=crop", // Orange fruit
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop", // Blue sky
        ],
        correctOptionIndex: 0,
        orderIndex: 5,
      },
    ];

    // Mission 5: Transportation
    const mission5Questions = [
      {
        missionId: insertedMissions[4].id,
        questionNumber: 1,
        questionText: 'Which one is a "Car"?',
        options: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop", // Car - red sports car
          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop", // Motorcycle
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=400&fit=crop", // Bus - city bus
        ],
        correctOptionIndex: 0,
        orderIndex: 1,
      },
      {
        missionId: insertedMissions[4].id,
        questionNumber: 2,
        questionText: 'Which one is a "Bicycle"?',
        options: [
          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop", // Motorcycle
          "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop", // Bicycle - classic bike
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=400&fit=crop", // Bus - city bus
        ],
        correctOptionIndex: 1,
        orderIndex: 2,
      },
      {
        missionId: insertedMissions[4].id,
        questionNumber: 3,
        questionText: 'Which one is an "Airplane"?',
        options: [
          "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=400&fit=crop", // Airplane - commercial jet
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=400&fit=crop", // Bus - city bus
          "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=400&fit=crop", // Ship - cruise ship
        ],
        correctOptionIndex: 0,
        orderIndex: 3,
      },
      {
        missionId: insertedMissions[4].id,
        questionNumber: 4,
        questionText: 'Which one is a "Train"?',
        options: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop", // Car - sports car
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=400&fit=crop", // Bus - city bus
          "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=400&fit=crop", // Train - passenger train
        ],
        correctOptionIndex: 2,
        orderIndex: 4,
      },
      {
        missionId: insertedMissions[4].id,
        questionNumber: 5,
        questionText: 'Which one is a "Bus"?',
        options: [
          "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=400&fit=crop", // Bus - yellow school bus
          "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=400&fit=crop", // Truck - cargo truck
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop", // Car - sports car
        ],
        correctOptionIndex: 0,
        orderIndex: 5,
      },
    ];

    const allMissionQuestions = [
      ...mission1Questions,
      ...mission2Questions,
      ...mission3Questions,
      ...mission4Questions,
      ...mission5Questions,
    ];

    const insertedMissionQuestions = await db
      .insert(missionQuestions)
      .values(allMissionQuestions)
      .returning();
    console.log(
      `✅ Inserted ${insertedMissionQuestions.length} mission questions`
    );

    console.log("");
    console.log("✨ Database seeding completed successfully!");
    console.log("");
    console.log("Summary:");
    console.log(`  📚 Materials: ${insertedMaterials.length}`);
    console.log(`  📝 Exams: ${insertedExams.length}`);
    console.log(`  ❓ Exam Questions: ${insertedExamQuestions.length}`);
    console.log(`  🎯 Missions: ${insertedMissions.length}`);
    console.log(`  🎮 Mission Questions: ${insertedMissionQuestions.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
