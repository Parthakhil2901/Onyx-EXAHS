import os
import streamlit as st
from dotenv import load_dotenv
import google.generativeai as gen_ai

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not GOOGLE_API_KEY:
    st.error("Google API key is not set. Please check your .env file and ensure you have either GOOGLE_API_KEY or GEMINI_API_KEY set.")
    st.stop()

# Configure Gemini AI
try:
    gen_ai.configure(api_key=GOOGLE_API_KEY)
    model = gen_ai.GenerativeModel("gemini-1.5-flash")
except Exception as e:
    st.error(f"Error configuring Gemini AI: {e}")
    st.stop()

# Streamlit page setup
st.set_page_config(
    page_title="Computer Science Learning Path Advisor",
    page_icon="🤖",
    layout="centered"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        text-align: center;
        color: #1f77b4;
        margin-bottom: 30px;
    }
    .step-container {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
    }
    .success-message {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
    }
    .course-card {
        background-color: #ffffff;
        border: 2px solid #e1e5e9;
        border-radius: 10px;
        padding: 15px;
        margin: 10px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .topic-badge {
        background-color: #007bff;
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8em;
        margin: 2px;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar instructions
with st.sidebar:
    st.markdown("## 🤖 CS Learning Path Advisor")
    st.markdown("### Steps to Follow:")
    st.markdown("1. **Choose your field of interest** 🎯")
    st.markdown("2. **Tell us your current knowledge** 📚")
    st.markdown("3. **Complete the assessment** 🧪")
    st.markdown("4. **Get your learning roadmap** 🗺️")
    st.markdown("---")
    st.markdown("💡 **Available Fields:**")
    st.markdown("• Artificial Intelligence")
    st.markdown("• Data Science")
    st.markdown("• Machine Learning")
    st.markdown("• Web Development")
    st.markdown("• Mobile Development")
    st.markdown("• Cybersecurity")
    st.markdown("• Cloud Computing")
    st.markdown("• DevOps")
    
    # Reset button
    if st.button("🔄 Start Over"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

    # Go to Dashboard button
    st.markdown('<a href="http://localhost:3000/dashboard.html" target="_blank"><button style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Go to Dashboard</button></a>', unsafe_allow_html=True)

# Initialize session state
if "stage" not in st.session_state:
    st.session_state.stage = "choose_field"
    st.session_state.chosen_field = ""
    st.session_state.current_knowledge = {}
    st.session_state.assessment_questions = []
    st.session_state.answers = {}
    st.session_state.roadmap = []
    st.session_state.additional_courses = []

# Computer Science fields and their subtopics
CS_FIELDS = {
    "Artificial Intelligence": {
        "description": "Learn to build intelligent systems that can perform tasks that typically require human intelligence",
        "topics": ["Neural Networks", "Natural Language Processing", "Computer Vision", "Reinforcement Learning", "Expert Systems", "AI Ethics"],
        "prerequisites": ["Python", "Mathematics", "Statistics"]
    },
    "Data Science": {
        "description": "Extract insights and knowledge from structured and unstructured data",
        "topics": ["Data Analysis", "Statistical Modeling", "Data Visualization", "Big Data", "Business Intelligence", "Predictive Analytics"],
        "prerequisites": ["Python/R", "Statistics", "SQL", "Mathematics"]
    },
    "Machine Learning": {
        "description": "Build systems that automatically learn and improve from experience",
        "topics": ["Supervised Learning", "Unsupervised Learning", "Deep Learning", "Feature Engineering", "Model Deployment", "MLOps"],
        "prerequisites": ["Python", "Mathematics", "Statistics", "Linear Algebra"]
    },
    "Web Development": {
        "description": "Create dynamic websites and web applications",
        "topics": ["Frontend Development", "Backend Development", "Databases", "API Development", "Web Security", "Cloud Deployment"],
        "prerequisites": ["HTML", "CSS", "JavaScript"]
    },
    "Mobile Development": {
        "description": "Build applications for mobile devices",
        "topics": ["iOS Development", "Android Development", "Cross-platform Development", "UI/UX Design", "Mobile Security", "App Store Optimization"],
        "prerequisites": ["Programming Fundamentals", "Object-Oriented Programming"]
    },
    "Cybersecurity": {
        "description": "Protect systems, networks, and data from digital attacks",
        "topics": ["Network Security", "Ethical Hacking", "Cryptography", "Incident Response", "Security Compliance", "Risk Assessment"],
        "prerequisites": ["Networking", "Operating Systems", "Programming"]
    },
    "Cloud Computing": {
        "description": "Design and manage scalable cloud-based solutions",
        "topics": ["AWS/Azure/GCP", "Containerization", "Microservices", "Serverless Computing", "Cloud Security", "Cost Optimization"],
        "prerequisites": ["Networking", "Operating Systems", "Programming"]
    },
    "DevOps": {
        "description": "Bridge development and operations for faster software delivery",
        "topics": ["CI/CD Pipelines", "Infrastructure as Code", "Monitoring", "Containerization", "Automation", "Cloud Platforms"],
        "prerequisites": ["Programming", "Linux", "Networking"]
    }
}

# Step 1 – Choose field of interest
def choose_field():
    st.markdown('<h1 class="main-header">🤖 Computer Science Learning Path Advisor</h1>', unsafe_allow_html=True)
    
    st.subheader("Step 1: Choose Your Field of Interest")
    st.write("Select the computer science field you want to learn about:")
    
    # Display field options with descriptions
    for field_name, field_info in CS_FIELDS.items():
        with st.container():
            st.markdown('<div class="course-card">', unsafe_allow_html=True)
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.markdown(f"### {field_name}")
                st.write(field_info["description"])
                
                # Show topic badges
                st.markdown("**Key Topics:**")
                topics_html = ""
                for topic in field_info["topics"][:4]:  # Show first 4 topics
                    topics_html += f'<span class="topic-badge">{topic}</span>'
                if len(field_info["topics"]) > 4:
                    topics_html += f'<span class="topic-badge">+{len(field_info["topics"])-4} more</span>'
                st.markdown(topics_html, unsafe_allow_html=True)
            
            with col2:
                if st.button(f"Choose {field_name}", key=f"btn_{field_name}"):
                    st.session_state.chosen_field = field_name
                    st.session_state.stage = "assess_knowledge"
                    st.rerun()
            
            st.markdown('</div>', unsafe_allow_html=True)

# Step 2 – Assess current knowledge
def assess_current_knowledge():
    st.markdown('<h1 class="main-header">📚 Assess Your Current Knowledge</h1>', unsafe_allow_html=True)
    
    field_info = CS_FIELDS[st.session_state.chosen_field]
    
    # Display chosen field
    st.markdown('<div class="success-message">', unsafe_allow_html=True)
    st.write(f"**Chosen Field:** {st.session_state.chosen_field}")
    st.write(f"**Description:** {field_info['description']}")
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.subheader("Step 2: Tell us about your current knowledge")
    
    with st.container():
        st.markdown('<div class="step-container">', unsafe_allow_html=True)
        
        # Overall experience level
        overall_level = st.selectbox(
            f"What's your overall experience level in {st.session_state.chosen_field}?",
            ["Complete Beginner", "Beginner", "Intermediate", "Advanced"],
            help="Choose the level that best describes your current knowledge"
        )
        
        st.markdown("---")
        
        # Knowledge assessment for each topic
        st.write("**Rate your knowledge level for each key topic:**")
        topic_knowledge = {}
        
        for topic in field_info["topics"]:
            topic_level = st.select_slider(
                f"{topic}:",
                options=["No Knowledge", "Basic", "Intermediate", "Advanced", "Expert"],
                value="No Knowledge",
                key=f"topic_{topic}"
            )
            topic_knowledge[topic] = topic_level
        
        st.markdown("---")
        
        # Prerequisites assessment
        st.write("**How familiar are you with the prerequisites?**")
        prereq_knowledge = {}
        
        for prereq in field_info["prerequisites"]:
            prereq_level = st.select_slider(
                f"{prereq}:",
                options=["No Knowledge", "Basic", "Intermediate", "Advanced", "Expert"],
                value="No Knowledge",
                key=f"prereq_{prereq}"
            )
            prereq_knowledge[prereq] = prereq_level
        
        # Additional information
        st.markdown("---")
        additional_info = st.text_area(
            "Any additional information about your background or specific goals?",
            placeholder="e.g., I'm a student, working professional, want to switch careers, specific projects in mind...",
            height=100
        )
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        if st.button("Continue to Assessment →", type="primary"):
            st.session_state.current_knowledge = {
                "overall_level": overall_level,
                "topic_knowledge": topic_knowledge,
                "prereq_knowledge": prereq_knowledge,
                "additional_info": additional_info
            }
            st.session_state.stage = "detailed_assessment"
            st.rerun()

# Step 3 – Detailed assessment with questions
def detailed_assessment():
    st.markdown('<h1 class="main-header">🧪 Detailed Assessment</h1>', unsafe_allow_html=True)
    
    # Display summary
    st.markdown('<div class="success-message">', unsafe_allow_html=True)
    st.write(f"**Field:** {st.session_state.chosen_field}")
    st.write(f"**Experience Level:** {st.session_state.current_knowledge['overall_level']}")
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Generate assessment questions if not already generated
    if not st.session_state.assessment_questions:
        with st.spinner("Generating personalized assessment questions..."):
            try:
                field_info = CS_FIELDS[st.session_state.chosen_field]
                knowledge = st.session_state.current_knowledge
                
                # Create detailed prompt for question generation
                topic_summary = []
                for topic, level in knowledge["topic_knowledge"].items():
                    topic_summary.append(f"{topic}: {level}")
                
                prereq_summary = []
                for prereq, level in knowledge["prereq_knowledge"].items():
                    prereq_summary.append(f"{prereq}: {level}")
                
                prompt = f"""Create 5 multiple-choice questions to assess knowledge in {st.session_state.chosen_field} for someone with {knowledge['overall_level']} experience level.

Field: {st.session_state.chosen_field}
Topic Knowledge: {'; '.join(topic_summary)}
Prerequisite Knowledge: {'; '.join(prereq_summary)}
Additional Info: {knowledge['additional_info']}

Create questions that:
1. Test practical understanding, not just theory
2. Are appropriate for their stated experience level
3. Cover different aspects of the field
4. Include scenario-based questions
5. Help identify specific learning gaps

Format each question exactly like this:
Q1: [Practical question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]

Make sure questions are relevant and help determine the best learning path."""

                response = model.generate_content(prompt)
                questions_text = response.text.strip()
                
                # Parse questions
                questions = []
                current_question = ""
                
                for line in questions_text.split('\n'):
                    line = line.strip()
                    if line.startswith('Q') and ':' in line:
                        if current_question:
                            questions.append(current_question.strip())
                        current_question = line
                    elif line and (line.startswith('A)') or line.startswith('B)') or 
                                 line.startswith('C)') or line.startswith('D)')):
                        current_question += '\n' + line
                
                if current_question:
                    questions.append(current_question.strip())
                
                st.session_state.assessment_questions = questions
                
            except Exception as e:
                st.error(f"Error generating questions: {e}")
                return

    # Display questions
    st.subheader("Answer the following questions:")
    st.write("These questions will help us create the most effective learning path for you.")
    
    answers = {}
    
    for idx, question_block in enumerate(st.session_state.assessment_questions):
        if not question_block:
            continue
            
        lines = [line.strip() for line in question_block.split('\n') if line.strip()]
        if not lines:
            continue
            
        # Extract question text
        question_line = lines[0]
        if ':' in question_line:
            question_text = question_line.split(':', 1)[1].strip()
        else:
            question_text = question_line
        
        # Extract options
        options = []
        for line in lines[1:]:
            if line and len(line) > 2 and line[1] == ')':
                options.append(line[3:].strip())
        
        if options:
            st.markdown("---")
            choice = st.radio(
                f"**Question {idx + 1}:** {question_text}",
                options,
                key=f"detailed_q{idx}",
                help=f"Select the best answer for question {idx + 1}"
            )
            answers[idx] = {"question": question_text, "choice": choice}

    st.session_state.answers = answers
    
    if len(answers) > 0:
        if st.button("Generate My Learning Roadmap →", type="primary"):
            st.session_state.stage = "generate_roadmap"
            st.rerun()

# Step 4 – Generate comprehensive roadmap
def generate_comprehensive_roadmap():
    st.markdown('<h1 class="main-header">🗺️ Your Personalized Learning Roadmap</h1>', unsafe_allow_html=True)
    
    # Display summary
    st.markdown('<div class="success-message">', unsafe_allow_html=True)
    st.write(f"**Field:** {st.session_state.chosen_field}")
    st.write(f"**Experience Level:** {st.session_state.current_knowledge['overall_level']}")
    st.write(f"**Assessment Completed:** {len(st.session_state.answers)} questions answered")
    st.markdown('</div>', unsafe_allow_html=True)

    # Generate roadmap and additional courses
    if not st.session_state.roadmap:
        with st.spinner("Creating your comprehensive learning roadmap..."):
            try:
                field_info = CS_FIELDS[st.session_state.chosen_field]
                knowledge = st.session_state.current_knowledge
                
                # Prepare assessment summary
                answers_summary = "\n".join([
                    f"Q: {a['question']}\nA: {a['choice']}" 
                    for a in st.session_state.answers.values()
                ])
                
                # Generate main roadmap
                main_prompt = f"""Create a comprehensive personalized learning roadmap for {st.session_state.chosen_field}.

STUDENT PROFILE:
- Field: {st.session_state.chosen_field}
- Overall Experience: {knowledge['overall_level']}
- Topic Knowledge: {knowledge['topic_knowledge']}
- Prerequisites: {knowledge['prereq_knowledge']}
- Background: {knowledge['additional_info']}

ASSESSMENT RESULTS:
{answers_summary}

Create a detailed roadmap with these sections:
1. **Foundation Phase** (Weeks 1-4): Prerequisites and basics
2. **Core Learning Phase** (Weeks 5-12): Main concepts and skills
3. **Practical Application Phase** (Weeks 13-20): Projects and hands-on work
4. **Advanced Topics Phase** (Weeks 21-28): Specialized areas
5. **Professional Development** (Weeks 29-36): Industry-relevant skills

For each phase, include:
- Specific topics to study
- Recommended resources (courses, books, tutorials)
- Practical projects
- Skills you'll gain
- Time estimates
- Prerequisites check

Format with clear headings, bullet points, and actionable steps."""

                roadmap_response = model.generate_content(main_prompt)
                main_roadmap = roadmap_response.text.strip()
                
                # Generate additional course recommendations
                courses_prompt = f"""Based on the student's profile in {st.session_state.chosen_field}, recommend 4-6 specific courses that would complement their learning journey.

Student Profile:
- Field: {st.session_state.chosen_field}
- Level: {knowledge['overall_level']}
- Background: {knowledge['additional_info']}

For each course, provide:
- Course title
- Description (2-3 sentences)
- Duration estimate
- Difficulty level
- Key skills learned
- Why it's recommended for this student

Focus on practical, industry-relevant courses from platforms like Coursera, edX, Udemy, or similar."""

                courses_response = model.generate_content(courses_prompt)
                additional_courses_text = courses_response.text.strip()
                
                st.session_state.roadmap = main_roadmap
                st.session_state.additional_courses = additional_courses_text
                
            except Exception as e:
                st.error(f"Error generating roadmap: {e}")
                return

    # Display main roadmap
    st.markdown("## 🚀 Your Learning Roadmap")
    st.markdown(st.session_state.roadmap)
    
    # Display additional course recommendations
    st.markdown("---")
    st.markdown("## 📚 Recommended Courses")
    st.markdown(st.session_state.additional_courses)
    
    # Interactive elements
    st.markdown("---")
    st.markdown("## 🎯 Quick Assessment: Are You Ready?")
    
    field_info = CS_FIELDS[st.session_state.chosen_field]
    
    # Prerequisites check
    st.subheader("Prerequisites Readiness Check:")
    for prereq in field_info["prerequisites"]:
        current_level = st.session_state.current_knowledge["prereq_knowledge"].get(prereq, "No Knowledge")
        if current_level in ["No Knowledge", "Basic"]:
            st.warning(f"⚠️ **{prereq}**: Consider strengthening this skill first")
        else:
            st.success(f"✅ **{prereq}**: You're ready!")
    
    # Action buttons
    st.markdown("---")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("📊 Retake Assessment"):
            st.session_state.stage = "detailed_assessment"
            st.session_state.assessment_questions = []
            st.session_state.answers = {}
            st.rerun()
    
    with col2:
        if st.button("🔄 Choose Different Field"):
            st.session_state.stage = "choose_field"
            st.session_state.assessment_questions = []
            st.session_state.answers = {}
            st.session_state.roadmap = []
            st.session_state.additional_courses = []
            st.rerun()
    
    with col3:
        if st.button("📧 Save Progress"):
            st.info("Feature coming soon! You can copy the roadmap above for now.")

# Progress indicator
def show_progress():
    progress_map = {"choose_field": 0, "assess_knowledge": 1, "detailed_assessment": 2, "generate_roadmap": 3}
    current_step = progress_map.get(st.session_state.stage, 0)
    
    st.progress((current_step + 1) / 4)
    steps = ["Choose Field", "Assess Knowledge", "Detailed Assessment", "Generate Roadmap"]
    st.write(f"**Step {current_step + 1}/4:** {steps[current_step]}")

# Main logic
def main():
    show_progress()
    
    if st.session_state.stage == "choose_field":
        choose_field()
    elif st.session_state.stage == "assess_knowledge":
        assess_current_knowledge()
    elif st.session_state.stage == "detailed_assessment":
        detailed_assessment()
    elif st.session_state.stage == "generate_roadmap":
        generate_comprehensive_roadmap()

if __name__ == "__main__":
    main()