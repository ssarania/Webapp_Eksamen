using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BasicProject.Data.Entities;
using BasicProject.Data.Repositories;
using Xunit;

namespace BasicProject.Tests
{
    public class InMemoryQuizRepositoryTests
    {
        [Fact]
        public void Create_ValidQuiz_AssignsIdAndStores()
        {
            var repo = new InMemoryQuizRepository();
            var quiz = new Quiz { Title = "My Quiz", AuthorId = 1L };

            var created = repo.Create(quiz);

            Assert.True(created.Id > 0);
            var fetched = repo.Get(created.Id);
            Assert.NotNull(fetched);
            Assert.Equal("My Quiz", fetched!.Title);
        }

        [Fact]
        public void Create_MissingTitle_ThrowsArgumentException()
        {
            var repo = new InMemoryQuizRepository();
            var quiz = new Quiz { Title = "" };

            Assert.Throws<ArgumentException>(() => repo.Create(quiz));
        }

        [Fact]
        public void Get_ExistingQuiz_ReturnsQuiz()
        {
            var repo = new InMemoryQuizRepository();
            var quiz = repo.Create(new Quiz { Title = "Q1" });

            var fetched = repo.Get(quiz.Id);

            Assert.NotNull(fetched);
            Assert.Equal(quiz.Id, fetched!.Id);
        }

        [Fact]
        public void Get_NonExistingQuiz_ReturnsNull()
        {
            var repo = new InMemoryQuizRepository();

            var fetched = repo.Get(999);

            Assert.Null(fetched);
        }

        [Fact]
        public void Update_ExistingQuiz_UpdatesAndReturns()
        {
            var repo = new InMemoryQuizRepository();
            var quiz = repo.Create(new Quiz { Title = "Old" });

            quiz.Title = "New";
            var updated = repo.Update(quiz);

            Assert.Equal("New", updated.Title);
            var fetched = repo.Get(quiz.Id);
            Assert.Equal("New", fetched!.Title);
        }

        [Fact]
        public void Update_NonExistingQuiz_ThrowsKeyNotFoundException()
        {
            var repo = new InMemoryQuizRepository();
            var quiz = new Quiz { Id = 999, Title = "DoesntExist" };

            Assert.Throws<KeyNotFoundException>(() => repo.Update(quiz));
        }

        [Fact]
        public void Delete_ExistingQuiz_ReturnsTrueAndRemoves()
        {
            var repo = new InMemoryQuizRepository();
            var quiz = repo.Create(new Quiz { Title = "ToDelete" });

            var deleted = repo.Delete(quiz.Id);

            Assert.True(deleted);
            Assert.Null(repo.Get(quiz.Id));
        }

        [Fact]
        public void Delete_NonExistingQuiz_ReturnsFalse()
        {
            var repo = new InMemoryQuizRepository();

            var deleted = repo.Delete(12345);

            Assert.False(deleted);
        }

        [Fact]
        public async Task GetByAuthorAsync_ReturnsQuizzesForAuthor()
        {
            var repo = new InMemoryQuizRepository();
            repo.Create(new Quiz { Title = "A1", AuthorId = 1L });
            repo.Create(new Quiz { Title = "A2", AuthorId = 2L });
            repo.Create(new Quiz { Title = "A3", AuthorId = 1L });

            var results = await repo.GetByAuthorAsync(1L);

            Assert.Equal(2, results.Count());
            Assert.All(results, q => Assert.Equal(1L, q.AuthorId));
        }
    }
}
