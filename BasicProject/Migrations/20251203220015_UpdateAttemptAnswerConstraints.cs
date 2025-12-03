using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasicProject.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttemptAnswerConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttemptAnswers_QuestionOptions_SelectedOptionId",
                table: "AttemptAnswers");

            migrationBuilder.AddForeignKey(
                name: "FK_AttemptAnswers_QuestionOptions_SelectedOptionId",
                table: "AttemptAnswers",
                column: "SelectedOptionId",
                principalTable: "QuestionOptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttemptAnswers_QuestionOptions_SelectedOptionId",
                table: "AttemptAnswers");

            migrationBuilder.AddForeignKey(
                name: "FK_AttemptAnswers_QuestionOptions_SelectedOptionId",
                table: "AttemptAnswers",
                column: "SelectedOptionId",
                principalTable: "QuestionOptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
