import React, { useEffect, useState } from "react"
import { graphql } from "gatsby";
import Img from "gatsby-image";
import Moment from "react-moment";
import Layout from "../components/layout";
import Markdown from "react-markdown";

export const query = graphql`
  query ArticleQuery($slug: String!) {
    strapiArticle(slug: { eq: $slug }, status: { eq: "published" }) {
      strapiId
      title
      description
      content
      publishedAt
      image {
        publicURL
        childImageSharp {
          fixed {
            src
          }
        }
      }
      author {
        name
        picture {
          childImageSharp {
            fixed(width: 30, height: 30) {
              src
            }
          }
        }
      }
    }
  }
`;

const Article = ({ data }) => {
  const article = data.strapiArticle;
  const seo = {
    metaTitle: article.title,
    metaDescription: article.description,
    shareImage: article.image,
    article: true,
  };

  const [comments, setComments] = useState([]);

  const fetchAllComments = () => {
    fetch("http://localhost:1337/commentaires?article=" + article.strapiId)
      .then(res=>res.json())
      .then( data => {
        const listCommentaires = data.map(leCommentaire=>{
          return <div>
            <p><span uk-icon="user"></span> Auteur {leCommentaire.auteur}
              <span uk-icon="calendar"></span> <span style={{fontSize: 10}}> Date {leCommentaire.published_at}</span>
            </p>
            <p><span uk-icon="commenting"></span> Commentaire {leCommentaire.commentaire}</p>

          </div>
        })
        setComments(listCommentaires);
      })
  }

  const submit = ev => {
      ev.preventDefault();
    const auteur = ev.target.auteur.value;
    const commentaire = ev.target.commentaire.value;
    console.log(auteur)
    console.log(commentaire)

    const leCommentaire = {
      auteur,
      commentaire,
      article: article.strapiId
    };

    fetch("http://localhost:1337/commentaires",{
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(leCommentaire)
    }).then(res=> res.json()).then(data=>{
      fetchAllComments();
      console.log(data)
    })
}


  useEffect(fetchAllComments, [article]);

  return (
    <Layout seo={seo}>
      <div>
        <div
          id="banner"
          className="uk-height-medium uk-flex uk-flex-center uk-flex-middle uk-background-cover uk-light uk-padding uk-margin"
          data-src={article.image.publicURL}
          data-srcset={article.image.publicURL}
          data-uk-img
        >
          <h1>{article.title}</h1>
        </div>

        <div className="uk-section">
          <div className="uk-container uk-container-small">
            <Markdown source={article.content} escapeHtml={false} />

            <hr className="uk-divider-small" />

            <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
              <div>
                {article.author.picture && (
                  <Img
                    fixed={article.author.picture.childImageSharp.fixed}
                    imgStyle={{ position: "static", borderRadius: "50%" }}
                  />
                )}
              </div>
              <div className="uk-width-expand">
                <p className="uk-margin-remove-bottom">
                  By {article.author.name}
                </p>
                <p className="uk-text-meta uk-margin-remove-top">
                  <Moment format="MMM Do YYYY">{article.published_at}</Moment>
                </p>
              </div>
            </div>
            <div>
              <hr className="uk-divider-small" />
              <div className="uk-card uk-card-default uk-card-hover uk-card-body">
                <h3 className="uk-card-title">Ajouter commentaire</h3>
                <form onSubmit={submit}>
                    <label>Auteur</label>
                  <input type="text" name="auteur"/>
                  <label>Commentaire</label>
                  <input type="text" name="commentaire"/>
                  <button className="uk-button uk-button-primary" type="submit">Envoyer</button>
                </form>
                <h3 className="uk-card-title">Commentaires</h3>
                {comments}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Article;
