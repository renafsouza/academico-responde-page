import React,{useState} from 'react';
import logo from './logo.svg';
import { Switch, Route } from 'react-router-dom'
import styled from 'styled-components'
const axios = require("axios")

function Login(props){
  let [emailEntry,setEmailEntry] = useState("");
  let [passwordEntry,setPasswordEntry] = useState("");

  return(<div>
    <input type="text" onChange={(e)=>setEmailEntry(e.target.value)} placeholder="email"/>
    <input type="password" onChange={(e)=>setPasswordEntry(e.target.value)} placeholder="senha"/>
    <button onClick={async ()=>{
      let userData = await axios.put(`http://localhost:5000/users/${emailEntry}`,{password:passwordEntry})
      if(userData.data.created){
        props.setEmail(emailEntry)
        localStorage.setItem("email",emailEntry)
      }
      console.log(userData.data.data);
    }}>Login</button></div>);

}
async function removerPost(postId,userEmail,setLoaded){
  await axios.put(`http://localhost:5000/${userEmail}/posts/${postId}/delete`)
  setLoaded(false);
}
function Post(props){
  let [titleEntry, setTitleEntry] = useState("")
  let [descEntry, setDescEntry] = useState("")
  let [editing, setEditing] = useState(false)
  const StyledA = styled.a`
    color:black;
    text-decoration:none;
    `;
  return [<StyledA href={`http://localhost:3000/posts?${props.questionId}`}>
    <span>{props.title}{
      props.userEmail==localStorage.getItem("email") || localStorage.admin?[
      <button onClick={(e)=>{e.preventDefault();setEditing(!editing);}}>editar</button>,
      <button onClick={(e)=>{e.preventDefault();removerPost(props.postId,props.userEmail,props.setLoaded)}}>remover</button>]:null
    }</span>
  </StyledA>,
  editing?<div>
    <input type="text" placeholder="titulo" onChange={(e)=>setTitleEntry(e.target.value)}></input>
    <input type="text" placeholder="descrição" onChange={(e)=>setDescEntry(e.target.value)}></input>
    <button onClick={async ()=>{
      await axios.put(`http://localhost:5000/${props.userEmail}/questions/${props.postId}/update`,{
        title:titleEntry,
        desc:descEntry
      });
      props.setLoaded(false)
      setEditing(false)
    }}>update</button>
  </div>:null]
}
function Posts(props){
  let [posts,setPosts] = useState(["awdawd"]);
  if(!props.loaded)
  axios.get(`http://localhost:5000/posts/list`).then((res)=>{
    setPosts(res.data);
    props.setLoaded(true)
  })
  const StyledUl = styled.ul`
    display:flex;
    flex-direction:column;
    `;
  return(
    <StyledUl>
      {posts.map((post)=>{
        return post.Question?<Post setLoaded={props.setLoaded} title={post.Question.title} postId={post.id} questionId={post.Question.id} userEmail={post.userEmail}/>:null
      })}
    </StyledUl>
  );
}
function PostForm(props){
  let [titleEntry,setTitleEntry] = useState("");
  let [descEntry,setDescEntry] = useState("");
  return(<div>
    <input type="text" onChange={(e)=>{
      setTitleEntry(e.target.value[e.target.value.length-1]=="?"?e.target.value:e.target.value+"?")
    }} placeholder="titulo"/>
    <input type="text" onChange={(e)=>setDescEntry(e.target.value)} placeholder="descrição"/>
    <button onClick={async ()=>{
      if(!localStorage.getItem("email"))
        return;
      let postId = parseInt(Math.random()*1000000000000)
      let postData = await axios.put(`http://localhost:5000/${localStorage.getItem("email")}/posts/${postId}/create`,{
        score: 0,
      })
      if(!postData)
        return;
      let questionId = parseInt(Math.random()*1000000000000)
      let questionData = await axios.put(`http://localhost:5000/${localStorage.getItem("email")}/questions/${questionId}/create`,{
        id:postId,
        desc:descEntry,
        title:titleEntry,
      })
      props.setLoaded(false)
    }}>Postar pergunta</button></div>);

}
function Register(props){
  let [emailEntry,setEmailEntry] = useState("");
  let [passwordEntry,setPasswordEntry] = useState("");
  let [nameEntry,setNameEntry] = useState("");
  let [usernameEntry,setUsernameEntry] = useState("");
  return(<div>
    <input type="text" onChange={(e)=>setNameEntry(e.target.value)}  placeholder="nome completo"/>
    <input type="text" onChange={(e)=>setUsernameEntry(e.target.value)} placeholder="username"/>
    <input type="text" onChange={(e)=>setEmailEntry(e.target.value)} placeholder="email"/>
    <input type="password" onChange={(e)=>setPasswordEntry(e.target.value)} placeholder="senha"/>
    <button onClick={async ()=>{
      let userData = await axios.put(`http://localhost:5000/users/${emailEntry}/create`,{
        "username":usernameEntry,
        "score":"0",
        "password":passwordEntry,
        "rname":nameEntry
      })
      if(userData.data.created){
        props.setEmail(emailEntry)
        localStorage.setItem("email",emailEntry)
      }
    }}>Registrar</button></div>);
}

function App() {
  return (
    <SitemapRoutes />
  );
}
function Home(){
  let [email,setEmail] = useState(localStorage.getItem("email"));
  let [loaded,setLoaded] = useState(false);
  return <div>
    {email?null:
    <Login setEmail={setEmail}/>}
    {email?null:
    <Register setEmail={setEmail}/>}
    <PostForm setLoaded={setLoaded}/>
    <Posts loaded={loaded} setLoaded={setLoaded}/>
    <button onClick={()=>{localStorage.clear()}}>Log out</button>
  </div>
}
function SitemapRoutes(){
  return <Switch>
    <Route path={"/"} exact={true} component={Home} />
    <Route path={"/posts"} exact={true} component={PostScreen} />
  </Switch>
}
function ReplyForm(props){
  let [contentEntry,setContentEntry] = useState("");
  return(<div>
    <input type="text" onChange={(e)=>setContentEntry(e.target.value)} placeholder="content"/>
    <button onClick={async ()=>{
      if(!props.post)
        return;
      if(!localStorage.getItem("email"))
        return;
      let postId = parseInt(Math.random()*1000000000000)
      let postData = await axios.put(`http://localhost:5000/${localStorage.getItem("email")}/posts/${postId}/create`,{
        score: 0,
      })
      if(!postData)
        return;
      let replyId = parseInt(Math.random()*1000000000000)
      console.log(props.post)
      let questionData = await axios.put(`http://localhost:5000/${props.post.id}/replies/${replyId}/create`,{
        postId,
        content:contentEntry,
      })
      props.setLoaded(false)
    }}>Responder</button></div>);
}
function Replies(props){
  let [replies,setReplies] = useState([]);
  let [question,setQuestion] = useState();
  let [post,setPost] = useState();
  if(!props.loaded)
    axios.get(`http://localhost:5000/${props.postId}/replies/list`).then((res)=>{
      if(res.data){
        setPost(res.data)
        setQuestion(res.data.Question)
        setReplies(res.data.Question.Replies);
        props.setLoaded(true)
      }
    })
  const StyledUl = styled.ul`
    display:flex;
    flex-direction:column;
    `;
  return(
    <div>
    {question?question.title:null}
    <br/>
    {question?question.desc:null}
    <StyledUl>
      {replies.map((reply)=>{
        return <Reply userEmail={post.user_email} setLoaded={props.setLoaded} reply={reply}/>
      })}
    </StyledUl>
      <ReplyForm setLoaded={props.setLoaded} post={post}/>
    </div>
  );
}
function Reply(props){
  let [editing,setEditing] = useState();
  let [contentEntry, setContentEntry] = useState("")
return [<div>{props.reply.content}{props.userEmail==localStorage.getItem("email") || localStorage.admin?[<button onClick={()=>setEditing(!editing)}>editar</button>,<button onClick={()=>{removerPergunta(props.reply.postId,props.setLoaded)}}>remover</button>]:null}</div>,
  editing?<div>
    <input type="text" placeholder="Conteúdo" onChange={(e)=>setContentEntry(e.target.value)}></input>
    <button onClick={async ()=>{
      await axios.put(`http://localhost:5000/replies/${props.reply.id}/update`,{
        content:contentEntry,
      });
      props.setLoaded(false)
      setEditing(false)
    }}>update</button>
  </div>:null]
}
async function removerPergunta(id, setLoaded){
  await axios.put(`http://localhost:5000/replies/${id}/delete`)
  setLoaded(false)
}
function PostScreen(props){
  let [loaded,setLoaded] = useState(false);
  let postId = props.location.search.substring(1)
  return <Replies loaded={loaded} setLoaded={setLoaded} postId={postId}></Replies>
}
export default App;
